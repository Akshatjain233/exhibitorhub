import { jest, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import {
    sendEmail,
    sendOTPEmail,
    sendWelcomeEmail,
    sendAdminNotification,
    sendOrderConfirmationEmail,
} from '../../../services/emailService.js';
import axios from 'axios';

// In native ESM, jest.mock() factory auto-mock doesn't work the same way.
// Use jest.spyOn on the imported module's methods instead.
let axiosPostSpy;

describe('Email Service - Exhaustive Tests', () => {
    beforeEach(() => {
        process.env.BREVO_API_KEY = 'test-api-key';
        process.env.BREVO_SENDER_EMAIL = 'test@sutragram.com';
        process.env.BREVO_SENDER_NAME = 'Test SutraGram';
        // Set up spy fresh for each test
        axiosPostSpy = jest.spyOn(axios, 'post');
    });

    afterEach(() => {
        delete process.env.BREVO_API_KEY;
        axiosPostSpy?.mockRestore();
    });

    describe('sendEmail() function', () => {
        test('should send email successfully', async () => {
            axiosPostSpy.mockResolvedValue({
                data: { messageId: 'msg-123' },
            });

            const result = await sendEmail({
                to: 'user@example.com',
                subject: 'Test Subject',
                htmlContent: '<p>Test</p>',
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('msg-123');
        });

        test('should call Brevo API with correct parameters', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-123' } });

            await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                htmlContent: '<p>Content</p>',
            });

            expect(axiosPostSpy).toHaveBeenCalledWith(
                'https://api.brevo.com/v3/smtp/email',
                expect.objectContaining({
                    sender: {
                        email: 'test@sutragram.com',
                        name: 'Test SutraGram',
                    },
                    to: [{ email: 'user@example.com' }],
                    subject: 'Test',
                    htmlContent: '<p>Content</p>',
                }),
                expect.objectContaining({
                    headers: {
                        'api-key': 'test-api-key',
                        'Content-Type': 'application/json',
                    },
                })
            );
        });

        test('should use textContent if provided', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-123' } });

            await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                htmlContent: '<p>Content</p>',
                textContent: 'Plain text',
            });

            expect(axiosPostSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    textContent: 'Plain text',
                }),
                expect.any(Object)
            );
        });

        test('should strip HTML tags for textContent if not provided', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-123' } });

            await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                htmlContent: '<p>Content</p>',
            });

            expect(axiosPostSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    textContent: 'Content',
                }),
                expect.any(Object)
            );
        });

        test('should work in dev mode without API key', async () => {
            delete process.env.BREVO_API_KEY;

            const result = await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                htmlContent: '<p>Test</p>',
            });

            expect(result.success).toBe(true);
            expect(result.dev_mode).toBe(true);
            expect(axiosPostSpy).not.toHaveBeenCalled();
        });

        test('should throw error on API failure', async () => {
            axiosPostSpy.mockRejectedValue({
                response: { data: { message: 'API Error' } },
            });

            await expect(
                sendEmail({
                    to: 'user@example.com',
                    subject: 'Test',
                    htmlContent: '<p>Test</p>',
                })
            ).rejects.toThrow('Failed to send email');
        });

        test('should handle network error', async () => {
            axiosPostSpy.mockRejectedValue(new Error('Network error'));

            await expect(
                sendEmail({
                    to: 'user@example.com',
                    subject: 'Test',
                    htmlContent: '<p>Test</p>',
                })
            ).rejects.toThrow('Failed to send email');
        });
    });

    describe('sendOTPEmail() function', () => {
        test('should send OTP email with correct structure', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-otp' } });

            const result = await sendOTPEmail('user@example.com', '123456', 'John Doe');

            expect(result.success).toBe(true);
            expect(axiosPostSpy).toHaveBeenCalled();

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.subject).toContain('Verification Code');
            expect(callArgs.htmlContent).toContain('123456');
            expect(callArgs.htmlContent).toContain('John Doe');
        });

        test('should use default name if not provided', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-otp' } });

            await sendOTPEmail('user@example.com', '654321');

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.htmlContent).toContain('User');
        });

        test('should include OTP in HTML content', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-otp' } });

            await sendOTPEmail('user@example.com', '999888', 'Test User');

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.htmlContent).toContain('999888');
        });

        test('should mention 10-minute expiration', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-otp' } });

            await sendOTPEmail('user@example.com', '123456');

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.htmlContent).toContain('10 minutes');
        });
    });

    describe('sendWelcomeEmail() function', () => {
        test('should send welcome email for consumer', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-welcome' } });

            const result = await sendWelcomeEmail('consumer@example.com', 'Jane', 'consumer');

            expect(result.success).toBe(true);

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.subject).toContain('Welcome');
            expect(callArgs.htmlContent).toContain('Jane');
            expect(callArgs.htmlContent).toContain('consumer');
        });

        test('should send welcome email for artisan with different content', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-welcome' } });

            await sendWelcomeEmail('artisan@example.com', 'Raj', 'artisan');

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.htmlContent).toContain('artisan');
            expect(callArgs.htmlContent).toContain('showcase your craft');
        });

        test('should use default role if not provided', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-welcome' } });

            await sendWelcomeEmail('user@example.com', 'Test');

            expect(axiosPostSpy).toHaveBeenCalled();
        });
    });

    describe('sendAdminNotification() function', () => {
        test('should send admin notification with details', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-admin' } });

            const result = await sendAdminNotification({
                subject: 'New Artisan',
                message: 'Artisan registered',
                details: { name: 'Test Artisan', email: 'artisan@example.com' },
            });

            expect(result.success).toBe(true);

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.to[0].email).toContain('admin');
            expect(callArgs.subject).toContain('[Admin]');
            expect(callArgs.htmlContent).toContain('New Artisan');
        });

        test('should handle missing details', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-admin' } });

            await sendAdminNotification({
                subject: 'Test',
                message: 'Test message',
            });

            expect(axiosPostSpy).toHaveBeenCalled();
        });
    });

    describe('sendOrderConfirmationEmail() function', () => {
        test('should send order confirmation with order details', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-order' } });

            const order = {
                _id: 'order123',
                total_amount: 1500,
            };

            const result = await sendOrderConfirmationEmail('customer@example.com', order);

            expect(result.success).toBe(true);

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.htmlContent).toContain('order123');
            expect(callArgs.htmlContent).toContain('1500');
        });
    });

    describe('Edge Cases', () => {
        test('should handle very long email addresses', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-123' } });

            const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';

            await sendEmail({
                to: longEmail,
                subject: 'Test',
                htmlContent: '<p>Test</p>',
            });

            expect(axiosPostSpy).toHaveBeenCalled();
        });

        test('should handle special characters in subject', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-123' } });

            await sendEmail({
                to: 'user@example.com',
                subject: 'Test <>&"\'',
                htmlContent: '<p>Test</p>',
            });

            expect(axiosPostSpy).toHaveBeenCalled();
        });

        test('should handle empty HTML content', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-123' } });

            await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                htmlContent: '',
            });

            expect(axiosPostSpy).toHaveBeenCalled();
        });

        test('should handle unicode in content', async () => {
            axiosPostSpy.mockResolvedValue({ data: { messageId: 'msg-123' } });

            await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                htmlContent: '<p>नमस्ते 🎉</p>',
            });

            const callArgs = axiosPostSpy.mock.calls[0][1];
            expect(callArgs.htmlContent).toContain('नमस्ते 🎉');
        });
    });
});
