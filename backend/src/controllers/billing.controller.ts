import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Initiate Stripe checkout session
 */
export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required.' });

    // Validate membership
    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: req.user.id, workspaceId } }
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Only workspace Owners or Admins can modify billing.' });
    }

    const checkoutUrl = await StripeService.createCheckoutSession(workspaceId, req.user.id);
    return res.json({ checkoutUrl });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Handle simulated local developer billing success redirects
 */
export const mockSuccess = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).send('Workspace ID is required.');
    }

    // Set Workspace directly to PRO tier in sandbox mode
    await prisma.workspace.update({
      where: { id: workspaceId as string },
      data: {
        tier: 'PRO',
        stripeCustomerId: 'mock-cus-sandbox',
        stripeSubscriptionId: 'mock-sub-sandbox'
      }
    });

    // Redirect user back to settings with a billing success flag
    return res.redirect(`http://localhost:3000/workspace/${workspaceId}/settings?billing=success`);
  } catch (err: any) {
    return res.status(500).send(err.message || 'Server error');
  }
};

/**
 * Stripe Payment Webhook receiver
 */
export const webhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!signature || !webhookSecret) {
    return res.status(400).send('Webhook configuration error.');
  }

  try {
    // Read raw body if possible or read buffer
    const verified = await StripeService.handleWebhook((req as any).rawBody || req.body, signature, webhookSecret);
    if (verified) {
      return res.status(200).send({ received: true });
    }
    return res.status(400).send('Webhook unhandled or unverified.');
  } catch (err: any) {
    return res.status(500).send(err.message || 'Server error');
  }
};
