import { jest, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import User from '../../../models/User.js';
import bcrypt from 'bcryptjs';

describe('User Model - Exhaustive Tests', () => {
    describe('Schema Validation', () => {
        test('should create user with valid required fields', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                phone_number: '+919876543210',
                password_hash: await bcrypt.hash('password123', 10),
                role: 'consumer',
            };

            const user = await User.create(userData);

            expect(user.name).toBe('Test User');
            expect(user.email).toBe('test@example.com');
            expect(user.role).toBe('consumer');
            expect(user.is_active).toBe(true); // Default value
        });

        test('should fail when name is missing', async () => {
            const userData = {
                email: 'test@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        test('should fail when email is missing', async () => {
            const userData = {
                name: 'Test User',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        test('should fail when email is invalid format', async () => {
            const userData = {
                name: 'Test User',
                email: 'invalid-email',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        test('should fail when phone_number is missing', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password_hash: 'hashed',
                role: 'consumer',
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        test('should fail when role is invalid', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'invalid_role',
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        test('should accept all valid roles', async () => {
            const roles = ['consumer', 'artisan', 'trader', 'admin'];

            for (const role of roles) {
                const user = await User.create({
                    name: `Test ${role}`,
                    email: `test${role}@example.com`,
                    phone_number: `+9198765432${roles.indexOf(role)}`,
                    password_hash: 'hashed',
                    role,
                });

                expect(user.role).toBe(role);
            }
        });

        test('should enforce unique email constraint', async () => {
            const userData = {
                name: 'User 1',
                email: 'duplicate@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            };

            await User.create(userData);

            // Attempt duplicate
            const duplicateUser = {
                name: 'User 2',
                email: 'duplicate@example.com',
                phone_number: '+919876543211',
                password_hash: 'hashed',
                role: 'consumer',
            };

            await expect(User.create(duplicateUser)).rejects.toThrow();
        });

        test('should set default values correctly', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'defaults@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            });

            expect(user.is_active).toBe(true);
            expect(user.is_verified).toBe(false);
            expect(user.preferred_language).toBe('en');
        });

        test('should accept valid language codes', async () => {
            const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu'];

            for (const lang of languages) {
                const user = await User.create({
                    name: `User ${lang}`,
                    email: `user${lang}@example.com`,
                    phone_number: `+9198765432${languages.indexOf(lang)}`,
                    password_hash: 'hashed',
                    role: 'consumer',
                    preferred_language: lang,
                });

                expect(user.preferred_language).toBe(lang);
            }
        });

        test('should reject invalid language code', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
                preferred_language: 'fr', // Not in enum
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        test('should store profile_image_url when provided', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'image@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
                profile_image_url: 'https://example.com/image.jpg',
            });

            expect(user.profile_image_url).toBe('https://example.com/image.jpg');
        });

        test('should store cover_image_url when provided', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'cover@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
                cover_image_url: 'https://example.com/cover.jpg',
            });

            expect(user.cover_image_url).toBe('https://example.com/cover.jpg');
        });

        test('should handle null optional fields', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'null@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
                profile_image_url: null,
                cover_image_url: null,
            });

            expect(user.profile_image_url).toBeNull();
            expect(user.cover_image_url).toBeNull();
        });
    });

    describe('Indexes', () => {
        test('should have index on email for fast lookups', async () => {
            const indexes = User.schema.indexes();
            const emailIndex = indexes.find((idx) => idx[0].email);

            expect(emailIndex).toBeDefined();
        });

        test('should have index on phone_number', async () => {
            const indexes = User.schema.indexes();
            const phoneIndex = indexes.find((idx) => idx[0].phone_number);

            expect(phoneIndex).toBeDefined();
        });
    });

    describe('Timestamps', () => {
        test('should auto-generate createdAt timestamp', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'timestamp@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            });

            expect(user.createdAt).toBeInstanceOf(Date);
        });

        test('should auto-generate updatedAt timestamp', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'updated@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            });

            expect(user.updatedAt).toBeInstanceOf(Date);
        });

        test('should update updatedAt on modification', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'modify@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            });

            const originalUpdatedAt = user.updatedAt;

            // Wait 100ms to ensure timestamp difference
            await new Promise((resolve) => setTimeout(resolve, 100));

            user.name = 'Updated Name';
            await user.save();

            expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });
    });

    describe('Edge Cases', () => {
        test('should handle extremely long name (boundary test)', async () => {
            const longName = 'A'.repeat(500);
            const user = await User.create({
                name: longName,
                email: 'longname@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            });

            expect(user.name).toBe(longName);
        });

        test('should handle empty string for optional fields', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'empty@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
                profile_image_url: '',
            });

            expect(user.profile_image_url).toBe('');
        });

        test('should handle special characters in name', async () => {
            const user = await User.create({
                name: "O'Brien-Smith (Test)",
                email: 'special@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            });

            expect(user.name).toBe("O'Brien-Smith (Test)");
        });

        test('should handle non-ASCII characters in name', async () => {
            const user = await User.create({
                name: 'राज कुमार',
                email: 'hindi@example.com',
                phone_number: '+919876543210',
                password_hash: 'hashed',
                role: 'consumer',
            });

            expect(user.name).toBe('राज कुमार');
        });
    });
});
