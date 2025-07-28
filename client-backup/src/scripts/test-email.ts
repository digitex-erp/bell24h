// src/scripts/test-email.ts
// A simple script to test email sending functionality

import { sendEmail } from '../utils/emailService';
import { getWelcomeEmailTemplate } from '../utils/emailTemplates';

// Enable more detailed logging
console.log('Starting email test script...');

async function testEmailService() {
  try {
    console.log('Testing email service...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST || '<not set>',
      port: process.env.SMTP_PORT || '<not set>',
      user: process.env.SMTP_USER ? '(set)' : '<not set>',
      pass: process.env.SMTP_PASS ? '(set)' : '<not set>',
    });
    
    // Test welcome email
    const testRecipient = 'test@example.com'; // Replace with a test email if needed
    console.log('Getting welcome template...');
    const welcomeTemplate = getWelcomeEmailTemplate('Test User');
    
    console.log(`Sending test email to: ${testRecipient}`);
    console.log(`Subject: ${welcomeTemplate.subject}`);
    console.log('Email content prepared, calling sendEmail function...');
    
    const result = await sendEmail({
      to: testRecipient,
      subject: welcomeTemplate.subject,
      text: welcomeTemplate.text,
      html: welcomeTemplate.html,
    });
    
    if (result) {
      console.log('Email sent successfully!');
      if (typeof result === 'string' && result.includes('ethereal')) {
        console.log(`Preview URL: ${result}`);
      } else {
        console.log(`Message ID: ${result}`);
      }
    } else {
      console.error('Failed to send email.');
    }
  } catch (error: any) {
    console.error('Error in test script:', error);
    console.error(error.stack);
  }
  console.log('Test email script completed.');
}

// Execute the test
testEmailService()
  .then(() => {
    console.log('Test email function completed successfully');
  })
  .catch((err: any) => {
    console.error('Uncaught error in test email script:', err);
    console.error(err.stack);
  });

console.log('Test email script initiated.');
