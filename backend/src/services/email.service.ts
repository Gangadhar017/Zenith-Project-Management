import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const hasApiKey = resendApiKey.trim().length > 0;

let resend: Resend | null = null;
if (hasApiKey) {
  try {
    resend = new Resend(resendApiKey);
  } catch (err) {
    console.error('Failed to initialize Resend client:', err);
  }
}

const fromDomain = process.env.EMAIL_FROM_DOMAIN || 'resend.dev';
const isSandbox = fromDomain === 'resend.dev';

const getFromAddress = (name: string, type: 'security' | 'tasks' | 'collab') => {
  const prefix = isSandbox ? 'onboarding' : type;
  return `${name} <${prefix}@${fromDomain}>`;
};

export class EmailService {
  /**
   * Send a beautiful, responsive HTML workspace invite email
   */
  static async sendWorkspaceInvite(to: string, inviterName: string, workspaceName: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>You've been invited to Zenith</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #fafafa;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header-glow {
            height: 4px;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
          }
          .content {
            padding: 40px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.05em;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 24px;
            display: inline-block;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-top: 0;
            margin-bottom: 24px;
            font-weight: 300;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            margin-bottom: 24px;
          }
          .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding: 24px;
            text-align: center;
            background-color: #09090b;
          }
          .footer-text {
            font-size: 11px;
            color: #52525b;
            line-height: 1.5;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header-glow"></div>
          <div class="content">
            <div class="logo">ZENITH</div>
            <h1>Join the collaboration</h1>
            <p><strong>${inviterName}</strong> has invited you to collaborate in their agile workspace <strong>"${workspaceName}"</strong> on Zenith.</p>
            <a href="http://localhost:3000/login" class="btn">Accept Invitation & View Workspace</a>
            <p style="font-size: 12px; color: #52525b; margin-bottom: 0;">If you don't have a Zenith account yet, you will be prompted to create one using this email address.</p>
          </div>
          <div class="footer">
            <p class="footer-text">This invitation was sent from Zenith PM. If you believe you received this in error, please ignore this email.</p>
            <p class="footer-text" style="margin-top: 8px;">&copy; 2026 Zenith SaaS Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (hasApiKey && resend) {
      try {
        await resend.emails.send({
          from: getFromAddress('Zenith PM', 'collab'),
          to,
          subject: `${inviterName} invited you to the "${workspaceName}" workspace on Zenith`,
          html: htmlContent
        });
        console.log(`[Resend] Invite email successfully sent to ${to}`);
      } catch (err) {
        console.error('[Resend] Failed to send workspace invite email:', err);
      }
    } else {
      console.warn(`[Mock Email] Dispatching workspace invite to ${to} (Resend API key missing)`);
    }
  }

  /**
   * Send a beautiful, responsive HTML task assignment email
   */
  static async sendTaskAssignment(to: string, assigneeName: string, taskTitle: string, projectName: string, priority: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Task Assigned on Zenith</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #fafafa;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header-glow {
            height: 4px;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
          }
          .content {
            padding: 40px;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.05em;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
          }
          h1 {
            font-size: 20px;
            font-weight: 800;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
            text-align: center;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-top: 0;
            margin-bottom: 24px;
            font-weight: 300;
          }
          .task-details {
            background-color: #09090b;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .task-row {
            margin-bottom: 12px;
            font-size: 13px;
          }
          .task-row:last-child {
            margin-bottom: 0;
          }
          .task-label {
            color: #52525b;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            display: inline-block;
            width: 100px;
          }
          .task-value {
            color: #fafafa;
            font-weight: 500;
          }
          .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: 900;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .priority-high {
            background-color: rgba(249, 115, 22, 0.2);
            color: #f97316;
          }
          .priority-urgent {
            background-color: rgba(239, 68, 68, 0.2);
            color: #ef4444;
          }
          .priority-other {
            background-color: rgba(255, 255, 255, 0.05);
            color: #a1a1aa;
          }
          .btn-container {
            text-align: center;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            margin-bottom: 24px;
          }
          .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding: 24px;
            text-align: center;
            background-color: #09090b;
          }
          .footer-text {
            font-size: 11px;
            color: #52525b;
            line-height: 1.5;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header-glow"></div>
          <div class="content">
            <div class="logo-container">
              <div class="logo">ZENITH</div>
            </div>
            <h1>New Task Assigned</h1>
            <p>Hello <strong>${assigneeName}</strong>,</p>
            <p>You have been assigned a new card task on the project board.</p>
            
            <div class="task-details">
              <div class="task-row">
                <span class="task-label">Task:</span>
                <span class="task-value">${taskTitle}</span>
              </div>
              <div class="task-row">
                <span class="task-label">Project:</span>
                <span class="task-value">${projectName}</span>
              </div>
              <div class="task-row">
                <span class="task-label">Priority:</span>
                <span class="priority-badge ${priority === 'HIGH' ? 'priority-high' : priority === 'URGENT' ? 'priority-urgent' : 'priority-other'}">${priority}</span>
              </div>
            </div>
            
            <div class="btn-container">
              <a href="http://localhost:3000/login" class="btn">View Card Details on Zenith</a>
            </div>
          </div>
          <div class="footer">
            <p class="footer-text">You are receiving this because you are an active member of the project team on Zenith PM.</p>
            <p class="footer-text" style="margin-top: 8px;">&copy; 2026 Zenith SaaS Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (hasApiKey && resend) {
      try {
        await resend.emails.send({
          from: getFromAddress('Zenith Tasks', 'tasks'),
          to,
          subject: `[Zenith] New Task Assigned: "${taskTitle}"`,
          html: htmlContent
        });
        console.log(`[Resend] Task notification email successfully sent to ${to}`);
      } catch (err) {
        console.error('[Resend] Failed to send task notification email:', err);
      }
    } else {
      console.warn(`[Mock Email] Dispatching task assignment notification to ${to} (Resend API key missing)`);
    }
  }

  /**
   * Send a premium dark-themed HTML OTP validation email for registration
   */
  static async sendRegistrationOTP(email: string, otpCode: string, name: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Zenith Registration</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #fafafa;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header-glow {
            height: 4px;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
          }
          .content {
            padding: 40px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.05em;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 24px;
            display: inline-block;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-top: 0;
            margin-bottom: 24px;
            font-weight: 300;
          }
          .otp-code {
            display: inline-block;
            font-family: 'Courier New', Courier, monospace;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 6px;
            background-color: #09090b;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 16px 32px;
            border-radius: 12px;
            margin: 16px 0;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8);
          }
          .warning-text {
            font-size: 12px;
            color: #ef4444;
            margin-top: 24px;
            font-weight: 400;
          }
          .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding: 24px;
            text-align: center;
            background-color: #09090b;
          }
          .footer-text {
            font-size: 11px;
            color: #52525b;
            line-height: 1.5;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header-glow"></div>
          <div class="content">
            <div class="logo">ZENITH</div>
            <h1>Verify your email address</h1>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for signing up for Zenith PM. Please enter the following 6-digit verification code to complete your registration. This code will expire in 10 minutes.</p>
            <div class="otp-code">${otpCode}</div>
            <p class="warning-text">If you did not initiate this request, please disregard this email. Do not share this code with anyone.</p>
          </div>
          <div class="footer">
            <p class="footer-text">This security notification was sent from Zenith PM.</p>
            <p class="footer-text" style="margin-top: 8px;">&copy; 2026 Zenith SaaS Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (hasApiKey && resend) {
      try {
        await resend.emails.send({
          from: getFromAddress('Zenith Security', 'security'),
          to: email,
          subject: `${otpCode} is your Zenith verification code`,
          html: htmlContent
        });
        console.log(`[Resend] Registration OTP email successfully sent to ${email}`);
      } catch (err) {
        console.error('[Resend] Failed to send registration OTP email:', err);
      }
    } else {
      console.warn(`[Mock Email] Dispatching registration OTP (${otpCode}) to ${email} (Resend API key missing)`);
    }
  }

  /**
   * Send a premium dark-themed HTML password recovery link email
   */
  static async sendPasswordResetLink(email: string, token: string, name: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Zenith Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #fafafa;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header-glow {
            height: 4px;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
          }
          .content {
            padding: 40px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.05em;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 24px;
            display: inline-block;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-top: 0;
            margin-bottom: 24px;
            font-weight: 300;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(90deg, #a855f7 0%, #3b82f6 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            margin-bottom: 24px;
          }
          .warning-text {
            font-size: 12px;
            color: #71717a;
            margin-top: 24px;
            font-weight: 400;
          }
          .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding: 24px;
            text-align: center;
            background-color: #09090b;
          }
          .footer-text {
            font-size: 11px;
            color: #52525b;
            line-height: 1.5;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header-glow"></div>
          <div class="content">
            <div class="logo">ZENITH</div>
            <h1>Reset your password</h1>
            <p>Hi <strong>${name}</strong>,</p>
            <p>We received a request to reset your password on Zenith PM. Click the button below to choose a new password. This recovery link is valid for 1 hour and can only be used once.</p>
            <a href="${resetUrl}" class="btn">Reset Password</a>
            <p class="warning-text">If you did not make this request, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p class="footer-text">This security notification was sent from Zenith PM.</p>
            <p class="footer-text" style="margin-top: 8px;">&copy; 2026 Zenith SaaS Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (hasApiKey && resend) {
      try {
        await resend.emails.send({
          from: getFromAddress('Zenith Security', 'security'),
          to: email,
          subject: `Reset your Zenith password`,
          html: htmlContent
        });
        console.log(`[Resend] Password reset link email successfully sent to ${email}`);
      } catch (err) {
        console.error('[Resend] Failed to send password reset email:', err);
      }
    } else {
      console.warn(`[Mock Email] Dispatching password reset link to ${email} (Resend API key missing)`);
    }
  }
}
