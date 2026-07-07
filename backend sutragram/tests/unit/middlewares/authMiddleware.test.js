import { jest, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import { protect, restrictTo } from '../../../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../../../models/User.js';
import { createTestUser } from '../../fixtures/helpers.js';

// Mock response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Mock next function
const mockNext = jest.fn();

describe('Auth Middleware - Exhaustive Tests', () => {
    describe('protect() middleware', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should authenticate user with valid Bearer token', async () => {
            const { user } = await createTestUser('consumer');
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');

            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user._id.toString()).toBe(user._id.toString());
            expect(next).toHaveBeenCalled();
        });

        test('should reject request without authorization header', async () => {
            const req = { headers: {} };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('No token'),
                })
            );
        });

        test('should reject request with malformed authorization header', async () => {
            const req = {
                headers: {
                    authorization: 'InvalidFormat token123',
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should reject request with invalid token', async () => {
            const req = {
                headers: {
                    authorization: 'Bearer invalid-token-string',
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should reject request with expired token', async () => {
            const { user } = await createTestUser('consumer');
            const expiredToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret', {
                expiresIn: '-1h',
            });

            const req = {
                headers: {
                    authorization: `Bearer ${expiredToken}`,
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should reject when user no longer exists', async () => {
            const { user } = await createTestUser('consumer');
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');

            // Delete user
            await User.findByIdAndDelete(user._id);

            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should handle empty Bearer token', async () => {
            const req = {
                headers: {
                    authorization: 'Bearer ',
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should handle lowercase bearer', async () => {
            const { user } = await createTestUser('consumer');
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');

            const req = {
                headers: {
                    authorization: `bearer ${token}`,
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            // Should still work (case-insensitive)
            expect(req.user).toBeDefined();
        });
    });

    describe('restrictTo() middleware', () => {
        test('should allow access for authorized role', async () => {
            const { user } = await createTestUser('admin');

            const req = { user };
            const res = mockResponse();
            const next = mockNext;

            const middleware = restrictTo('admin');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should deny access for unauthorized role', async () => {
            const { user } = await createTestUser('consumer');

            const req = { user };
            const res = mockResponse();
            const next = mockNext;

            const middleware = restrictTo('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('permission'),
                })
            );
        });

        test('should allow access for multiple authorized roles', async () => {
            const { user } = await createTestUser('artisan');

            const req = { user };
            const res = mockResponse();
            const next = mockNext;

            const middleware = restrictTo('admin', 'artisan');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('should deny access when role not in list', async () => {
            const { user } = await createTestUser('consumer');

            const req = { user };
            const res = mockResponse();
            const next = mockNext;

            const middleware = restrictTo('admin', 'artisan');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should handle missing user object', async () => {
            const req = {};
            const res = mockResponse();
            const next = mockNext;

            const middleware = restrictTo('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should handle user without role property', async () => {
            const req = {
                user: { _id: '123', name: 'Test' }, // No role
            };
            const res = mockResponse();
            const next = mockNext;

            const middleware = restrictTo('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should be case-sensitive for roles', async () => {
            const { user } = await createTestUser('admin');

            const req = { user };
            const res = mockResponse();
            const next = mockNext;

            const middleware = restrictTo('Admin'); // Capital A
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403); // Should fail
        });
    });

    describe('Integration: protect + restrictTo', () => {
        test('should work together for authenticated admin', async () => {
            const { user } = await createTestUser('admin');
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');

            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };
            const res = mockResponse();
            const next = mockNext;

            // First protect
            await protect(req, res, next);

            // Then restrictTo
            const restrictMiddleware = restrictTo('admin');
            restrictMiddleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(2);
        });

        test('should reject at protect stage for invalid token', async () => {
            const req = {
                headers: {
                    authorization: 'Bearer invalid',
                },
            };
            const res = mockResponse();
            const next = mockNext;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
