import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const hasApiKey = stripeSecretKey.trim().length > 0;

let stripe: any = null;
if (hasApiKey) {
  try {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10' as any
    });
  } catch (err) {
    console.error('Failed to initialize Stripe client:', err);
  }
}

export class StripeService {
  /**
   * Create a premium Checkout Session for subscription
   */
  static async createCheckoutSession(workspaceId: string, userId: string): Promise<string> {
    const successUrl = `http://localhost:3000/workspace/${workspaceId}/settings?billing=success`;
    const cancelUrl = `http://localhost:3000/workspace/${workspaceId}/settings?billing=cancel`;

    if (hasApiKey && stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Zenith Enterprise Pro Plan',
                  description: 'Unlimited scrum boards, multiplayer collaboration, vector-dense AI chatbot, and transaction queues.'
                },
                unit_amount: 1900, // $19.00 USD
                recurring: { interval: 'month' }
              },
              quantity: 1
            }
          ],
          mode: 'subscription',
          metadata: { workspaceId, userId },
          success_url: successUrl,
          cancel_url: cancelUrl
        });

        return session.url || successUrl;
      } catch (err) {
        console.error('[Stripe] Failed to create checkout session:', err);
      }
    }

    // High fidelity offline developer sandbox fallback checkout url
    console.warn('[Stripe Service] Stripe API key not configured. Redirecting to sandbox mock success portal.');
    return `http://localhost:8000/api/billing/mock-success?workspaceId=${workspaceId}`;
  }

  /**
   * Handle incoming Stripe payment webhooks
   */
  static async handleWebhook(rawBody: string, signature: string, webhookSecret: string): Promise<boolean> {
    if (!hasApiKey || !stripe) return false;

    try {
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const workspaceId = session.metadata?.workspaceId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (workspaceId) {
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              tier: 'PRO',
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId
            }
          });
          console.log(`[Stripe Webhook] Workspace "${workspaceId}" successfully upgraded to PRO tier!`);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('[Stripe Webhook] Verification failed:', err);
      return false;
    }
  }
}
