// src/utils/emailService.ts
import nodemailer from 'nodemailer';
import { emailTemplates } from './emailTemplates';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Bell24H" <${process.env.SMTP_FROM || 'noreply@bell24h.com'}>`,
      to,
      subject,
      html,
      text,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string, userName?: string) {
  const template = emailTemplates.passwordReset({
    resetLink,
    userName,
    expiryHours: 1,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendPasswordResetSuccessEmail(email: string, loginLink: string, userName?: string) {
  const template = emailTemplates.passwordResetSuccess({
    resetLink: loginLink,
    userName,
    expiryHours: 0,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// Verify SMTP connection configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
}

// Example usage (you can remove this or use it for testing):
/*
(async () => {
  if (process.env.NODE_ENV !== 'production') { // Only run example in dev
    const previewLink = await sendEmail({
      to: 'test@example.com', // Change to a recipient for testing
      subject: 'Hello from Bell24H.com ✔',
      text: 'Hello world?',
      html: '<b>Hello world?</b>',
    });
    if (previewLink) {
      console.log(`Email sent! Preview at ${previewLink}`);
    } else {
      console.log('Email sent or failed, check logs.');
    }
  }
})();
*/
