import request from 'supertest';
import app from '../../server.js';
import { createTestUser, generateToken, authHeaders } from '../fixtures/helpers.js';
import User from '../../models/User.js';

describe('Auth Controller', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone_number: '+919876543210',
                password: 'Test@123',
                role: 'consumer',
                preferred_language: 'en',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user).toHaveProperty('email', userData.email);

            // Verify user exists in database
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.role).toBe('consumer');
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ name: 'John Doe' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with duplicate email', async () => {
            await createTestUser('consumer', { email: 'duplicate@example.com' });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'duplicate@example.com',
                    phone_number: '+919876543211',
                    password: 'Test@123',
                    role: 'consumer',
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/already exists/i);
        });
    });

    describe('POST /api/auth/login', () => {
        let testUser;
        const testPassword = 'Test@123';

        beforeEach(async () => {
            const result = await createTestUser('consumer', {
                email: 'login@example.com',
            });
            testUser = result.user;
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testPassword,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(testUser.email);
        });

        it('should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testPassword,
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/users/me', () => {
        it('should get current user with valid token', async () => {
            const { user } = await createTestUser('artisan');
            const token = generateToken(user._id);

            const response = await request(app)
                .get('/api/users/me')
                .set(authHeaders(token));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(user.email);
        });

        it('should fail without token', async () => {
            const response = await request(app).get('/api/users/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set({ Authorization: 'Bearer invalid-token' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
