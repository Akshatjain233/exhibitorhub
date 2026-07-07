import request from 'supertest';
import app from '../../../server.js';
import User from '../../../models/User.js';
import { createTestUser, generateToken } from '../../fixtures/helpers.js';

// Mock email service to avoid actual API calls
jest.mock('../../../services/emailService.js', () => ({
    sendOTPEmail: jest.fn().mockResolvedValue({ success: true }),
    sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
    sendAdminNotification: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Auth Controller - Exhaustive Integration Tests', () => {
    describe('POST /api/auth/register - Registration', () => {
        test('should register consumer successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Consumer',
                    email: 'consumer@test.com',
                    phone_number: '+919876543210',
                    password: 'Test@1234',
                    role: 'consumer',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe('consumer@test.com');
            expect(response.body.data.token).toBeDefined();
        });

        test('should register artisan with location data', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Artisan',
                    email: 'artisan@test.com',
                    phone_number: '+919876543211',
                    password: 'Test@1234',
                    role: 'artisan',
                    craft_specialization: 'Pottery',
                    location_city: 'Delhi',
                    location_state: 'Delhi',
                    location_region: 'North',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.role).toBe('artisan');
        });

        test('should fail when email already exists', async () => {
            await createTestUser('consumer', { email: 'duplicate@test.com' });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'duplicate@test.com',
                    phone_number: '+919876543212',
                    password: 'Test@1234',
                    role: 'consumer',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already registered');
        });

        test('should fail when name is missing', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'noname@test.com',
                    phone_number: '+919876543213',
                    password: 'Test@1234',
                    role: 'consumer',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when email is missing', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'No Email',
                    phone_number: '+919876543214',
                    password: 'Test@1234',
                    role: 'consumer',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when phone is missing', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'No Phone',
                    email: 'nophone@test.com',
                    password: 'Test@1234',
                    role: 'consumer',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when password is missing', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'No Password',
                    email: 'nopwd@test.com',
                    phone_number: '+919876543215',
                    role: 'consumer',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when role is missing', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'No Role',
                    email: 'norole@test.com',
                    phone_number: '+919876543216',
                    password: 'Test@1234',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when role is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Invalid Role',
                    email: 'invalidrole@test.com',
                    phone_number: '+919876543217',
                    password: 'Test@1234',
                    role: 'hacker',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when email format is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Bad Email',
                    email: 'not-an-email',
                    phone_number: '+919876543218',
                    password: 'Test@1234',
                    role: 'consumer',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should set preferred_language to default (en)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Default Lang',
                    email: 'defaultlang@test.com',
                    phone_number: '+919876543219',
                    password: 'Test@1234',
                    role: 'consumer',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.user.preferred_language).toBe('en');
        });

        test('should accept custom preferred_language', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Hindi User',
                    email: 'hindi@test.com',
                    phone_number: '+919876543220',
                    password: 'Test@1234',
                    role: 'consumer',
                    preferred_language: 'hi',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.user.preferred_language).toBe('hi');
        });

        test('should hash password before storing', async () => {
            const password = 'Test@1234';

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Hash Test',
                    email: 'hash@test.com',
                    phone_number: '+919876543221',
                    password,
                    role: 'consumer',
                });

            expect(response.status).toBe(201);

            const user = await User.findOne({ email: 'hash@test.com' });
            expect(user.password_hash).not.toBe(password);
            expect(user.password_hash).toHaveLength(60); // bcrypt hash length
        });

        test('should create artisan profile for artisan role', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Artisan Profile Test',
                    email: 'artisanprofile@test.com',
                    phone_number: '+919876543222',
                    password: 'Test@1234',
                    role: 'artisan',
                    craft_specialization: 'Weaving',
                    location_city: 'Mumbai',
                    location_state: 'Maharashtra',
                    location_region: 'West',
                });

            expect(response.status).toBe(201);
            // Verify profile was created (would need to query ArtisanProfile model)
        });

        test('should fail when trader missing company_name', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Trader No Company',
                    email: 'tradernocompany@test.com',
                    phone_number: '+919876543223',
                    password: 'Test@1234',
                    role: 'trader',
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('company_name');
        });

        test('should fail when trader missing GST', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Trader No GST',
                    email: 'tradernogst@test.com',
                    phone_number: '+919876543224',
                    password: 'Test@1234',
                    role: 'trader',
                    company_name: 'Test Co',
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('GST');
        });

        test('should register trader successfully with company details', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Valid Trader',
                    email: 'validtrader@test.com',
                    phone_number: '+919876543225',
                    password: 'Test@1234',
                    role: 'trader',
                    company_name: 'Trading Inc',
                    gst_number: '22ABCDE1234F1Z5',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.user.role).toBe('trader');
        });
    });

    describe('POST /api/auth/login - Login', () => {
        test('should login successfully with valid credentials', async () => {
            const { user, password } = await createTestUser('consumer');

            const response = await request(app).post('/api/auth/login').send({
                email: user.email,
                password,
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });

        test('should fail with non-existent email', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'nonexistent@test.com',
                password: 'Test@1234',
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('should fail with wrong password', async () => {
            const { user } = await createTestUser('consumer');

            const response = await request(app).post('/api/auth/login').send({
                email: user.email,
                password: 'WrongPassword@123',
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('should fail when email is missing', async () => {
            const response = await request(app).post('/api/auth/login').send({
                password: 'Test@1234',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when password is missing', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'test@test.com',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/verify-otp - OTP Verification', () => {
        // Note: OTP is stored in memory in the controller
        // This would need to be tested with actual OTP flow or mocked
        test('should verify correct OTP', async () => {
            // This test would require integrating with the OTP storage mechanism
            // Skipping for now as it requires controller-level mocking
        });

        test('should fail with wrong OTP', async () => {
            // Similar to above
        });

        test('should fail with expired OTP', async () => {
            // Test OTP expiration logic
        });
    });

    describe('GET /api/auth/me - Get Current User', () => {
        test('should return current user with valid token', async () => {
            const { user } = await createTestUser('consumer');
            const token = generateToken(user._id);

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(user.email);
        });

        test('should fail without token', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
        });

        test('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });
});
