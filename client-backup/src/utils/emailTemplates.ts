// src/utils/emailTemplates.ts
/**
 * Centralized email templates for the application
 * All templates use a consistent design language and include both HTML and plain text versions
 */

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

interface EmailTemplateData {
  resetLink: string;
  userName?: string;
  expiryHours: number;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

/**
 * Base template for all emails with consistent styling
 */
function getBaseTemplate(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 30px;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .note {
            background-color: #f0f4ff;
            border-left: 4px solid #4a6ee0;
            padding: 12px;
            margin: 20px 0;
          }
          .note p {
            margin: 0;
            color: #2c3e50;
            font-size: 14px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #777777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bell24H</h1>
          </div>
          <div class="content">
            ${content}
            <div class="footer">
              <p>If you didn't request this email, you can safely ignore it.</p>
              <p>&copy; ${new Date().getFullYear()} Bell24H. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Welcome email template for new users
 */
export function getWelcomeEmailTemplate(name: string): EmailTemplate {
  const title = 'Welcome to Bell24H';
  const loginUrl = `${APP_URL}/login`;
  const content = `
    <h2>Welcome to Bell24H, ${name}!</h2>
    <p>Thank you for joining our platform. We're excited to have you on board.</p>
    <p>Get started by exploring our features and customizing your profile.</p>
    <p>To get started, log in to your account here: <a href="${loginUrl}" class="button">Login to Your Account</a></p>
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;

  return {
    subject: title,
    text: `Welcome to Bell24H, ${name}!

Thank you for joining our platform. We're excited to have you on board.

Login to your account here: ${loginUrl}

If you have any questions, feel free to reach out to our support team.`,
    html: getBaseTemplate(content, title)
  };
}

/**
 * Password reset email template
 */
export function getPasswordResetEmailTemplate(name: string, resetToken: string): EmailTemplate {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  const title = 'Reset Your Password';
  const expiryHours = 1;
  
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your Bell24H account.</p>
    <p>To reset your password, please click the button below:</p>
    
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Your Password</a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${resetUrl}" style="word-break: break-all; color: #0066cc;">${resetUrl}</a></p>
    
    <div class="note">
      <p><strong>Note:</strong> This link will expire in ${expiryHours} hour${expiryHours !== 1 ? 's' : ''}.</p>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
    </div>
    
    <p>If you have any questions, please contact our support team.</p>
  `;

  return {
    subject: title,
    text: `Password Reset Request

Hello ${name},

We received a request to reset the password for your Bell24H account.

To reset your password, please visit the following link:
${resetUrl}

Note: This link will expire in ${expiryHours} hour${expiryHours !== 1 ? 's' : ''}.
If you didn't request this password reset, you can safely ignore this email.

If you have any questions, please contact our support team.`,
    html: getBaseTemplate(content, title)
  };
}

/**
 * RFQ submission confirmation email template
 */
export function getRfqSubmissionEmailTemplate(name: string, rfqNumber: string): EmailTemplate {
  const rfqUrl = `${APP_URL}/rfq/${rfqNumber}`;
  const title = 'Your RFQ Has Been Submitted';
  
  const content = `
    <h2>RFQ #${rfqNumber} Submitted Successfully</h2>
    <p>Hello ${name},</p>
    <p>Thank you for submitting your RFQ. We've received your request and our team will review it shortly.</p>
    <p>You can track the status of your RFQ by clicking the button below:</p>
    
    <p style="text-align: center;">
      <a href="${rfqUrl}" class="button">View RFQ Status</a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${rfqUrl}" style="word-break: break-all; color: #0066cc;">${rfqUrl}</a></p>
    
    <p>If you have any questions about your RFQ, please contact our support team.</p>
  `;

  return {
    subject: title,
    text: `RFQ #${rfqNumber} Submitted Successfully

Hello ${name},

Thank you for submitting your RFQ. We've received your request and our team will review it shortly.

You can track the status of your RFQ here:
${rfqUrl}

If you have any questions about your RFQ, please contact our support team.`,
    html: getBaseTemplate(content, title)
  };
}

/**
 * Payment confirmation email template
 */
export function getPaymentConfirmationEmailTemplate(name: string, amount: string, transactionId: string): EmailTemplate {
  const title = 'Payment Confirmation';
  const transactionsUrl = `${APP_URL}/dashboard/transactions`;
  
  const content = `
    <h2>Payment Confirmation</h2>
    <p>Hello ${name},</p>
    <p>Your payment of <strong>${amount}</strong> has been successfully processed.</p>
    <p><strong>Transaction ID:</strong> ${transactionId}</p>
    
    <p style="text-align: center;">
      <a href="${transactionsUrl}" class="button">View Transaction Details</a>
    </p>
    
    <p>You can also view the details of this transaction in your account dashboard at any time.</p>
    
    <div class="note">
      <p><strong>Note:</strong> This is an automated confirmation. Please keep this email for your records.</p>
    </div>
    
    <p>If you have any questions about this transaction, please contact our support team.</p>
  `;

  return {
    subject: title,
    text: `Payment Confirmation

Hello ${name},

Your payment of ${amount} has been successfully processed.

Transaction ID: ${transactionId}

You can view the details of this transaction in your account dashboard:
${transactionsUrl}

Note: This is an automated confirmation. Please keep this email for your records.

If you have any questions about this transaction, please contact our support team.`,
    html: getBaseTemplate(content, title)
  };
}

export const emailTemplates = {
  passwordReset: (data: EmailTemplateData) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1976d2;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #1976d2;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 10px;
              border-radius: 4px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${data.resetLink}" class="button">Reset Password</a>
              </div>

              <div class="warning">
                <p><strong>Important:</strong> This link will expire in ${data.expiryHours} hours.</p>
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              </div>

              <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${data.resetLink}</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Bell24H. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request

      Hello${data.userName ? ` ${data.userName}` : ''},

      We received a request to reset your password. Click the link below to create a new password:

      ${data.resetLink}

      Important: This link will expire in ${data.expiryHours} hours.

      If you didn't request this password reset, please ignore this email or contact support if you have concerns.

      This is an automated message, please do not reply to this email.

      © ${new Date().getFullYear()} Bell24H. All rights reserved.
    `,
  }),

  passwordResetSuccess: (data: EmailTemplateData) => ({
    subject: 'Password Reset Successful',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4caf50;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4caf50;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Your password has been successfully reset. You can now log in with your new password.</p>
              
              <div style="text-align: center;">
                <a href="${data.resetLink}" class="button">Log In</a>
              </div>

              <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Bell24H. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Successful

      Hello${data.userName ? ` ${data.userName}` : ''},

      Your password has been successfully reset. You can now log in with your new password.

      If you didn't make this change, please contact our support team immediately.

      This is an automated message, please do not reply to this email.

      © ${new Date().getFullYear()} Bell24H. All rights reserved.
    `,
  }),
};
