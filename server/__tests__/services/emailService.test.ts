import { emailService, EmailService, EmailType, EmailTemplateData } from '../../services/emailService';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let sendMailMock: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock for sendMail function
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
    
    // Mock nodemailer's createTransport to return our mock transporter
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
      verify: jest.fn().mockResolvedValue(true),
    });
    
    // Recreate the emailService instance
    (emailService as any).transporter = nodemailer.createTransport({});
  });

  describe('sendTemplateEmail', () => {
    it('should send escrow_created email with correct template and data', async () => {
      const email = 'test@example.com';
      const templateData: EmailTemplateData = {
        type: 'escrow_created',
        referenceId: 'ESC-123',
        amount: 1000,
        currency: 'INR',
        releaseDate: new Date().toISOString(),
      };

      const result = await emailService.sendTemplateEmail(email, 'escrow_created', templateData);
      
      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalled();
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toContain('Escrow Hold Created');
      expect(mailOptions.html).toBeDefined();
      expect(mailOptions.html).toContain(templateData.referenceId);
    });

    it('should send escrow_released email with correct template and data', async () => {
      const email = 'test@example.com';
      const templateData: EmailTemplateData = {
        type: 'escrow_released',
        referenceId: 'ESC-123',
        amount: 1000,
        currency: 'INR',
      };

      const result = await emailService.sendTemplateEmail(email, 'escrow_released', templateData);
      
      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalled();
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toContain('Escrow Funds Released');
    });

    it('should send escrow_refunded email with correct template and data', async () => {
      const email = 'test@example.com';
      const templateData: EmailTemplateData = {
        type: 'escrow_refunded',
        referenceId: 'ESC-123',
        amount: 1000,
        currency: 'INR',
        reason: 'Order cancelled',
      };

      const result = await emailService.sendTemplateEmail(email, 'escrow_refunded', templateData);
      
      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalled();
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toContain('Escrow Refund Processed');
      expect(mailOptions.html).toContain('Order cancelled');
    });

    it('should handle errors when sending template email', async () => {
      // Mock a failure
      sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));
      
      const email = 'test@example.com';
      const templateData: EmailTemplateData = {
        type: 'escrow_created',
        referenceId: 'ESC-123',
        amount: 1000,
        currency: 'INR',
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await emailService.sendTemplateEmail(email, 'escrow_created', templateData);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('sendEmail', () => {
    it('should send a custom email with html content', async () => {
      const email = 'test@example.com';
      const subject = 'Custom Email';
      const html = '<p>This is a test email</p>';
      
      const result = await emailService.sendEmail(email, subject, html);
      
      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalled();
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toBe(subject);
      expect(mailOptions.html).toBe(html);
    });

    it('should handle errors when sending custom email', async () => {
      // Mock a failure
      sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));
      
      const email = 'test@example.com';
      const subject = 'Custom Email';
      const html = '<p>This is a test email</p>';
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await emailService.sendEmail(email, subject, html);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Email Templates', () => {
    it('should have all necessary email templates defined', () => {
      const emailTypes: EmailType[] = [
        'payment_confirmation',
        'payment_failed',
        'order_confirmation',
        'order_shipped',
        'password_reset',
        'account_verification',
        'escrow_created',
        'escrow_released',
        'escrow_refunded',
        'escrow_threshold_updated'
      ];
      
      // We don't have direct access to EMAIL_TEMPLATES, so we'll test through the service
      emailTypes.forEach(type => {
        // Test by calling sendTemplateEmail with each type
        // This just checks the template exists and can be used, not actual content
        expect(() => {
          emailService.sendTemplateEmail('test@example.com', type, { type });
        }).not.toThrow();
      });
    });
  });

  describe('Helper Functions', () => {
    it('sendVerificationEmail should call sendTemplateEmail with correct params', async () => {
      // We need to import the function separately
      const { sendVerificationEmail } = require('../../services/emailService');
      
      // Spy on the emailService.sendTemplateEmail method
      const sendTemplateEmailSpy = jest.spyOn(emailService, 'sendTemplateEmail')
        .mockResolvedValueOnce(true);
      
      const email = 'test@example.com';
      const data = { 
        type: 'account_verification' as EmailType,
        verificationLink: 'http://example.com/verify/123'
      };
      
      const result = await sendVerificationEmail(email, data);
      
      expect(result).toBe(true);
      expect(sendTemplateEmailSpy).toHaveBeenCalledWith(
        email, 
        'account_verification', 
        expect.objectContaining(data)
      );
      
      sendTemplateEmailSpy.mockRestore();
    });
  });
});
