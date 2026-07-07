import { jest, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import { encrypt, decrypt, hashForSearch, maskSensitiveData } from '../../../services/encryptionService.js';

describe('Encryption Service - Exhaustive Tests', () => {
    describe('encrypt() function', () => {
        test('should encrypt string successfully', () => {
            const plaintext = 'sensitive data';
            const encrypted = encrypt(plaintext);

            expect(encrypted).toBeDefined();
            expect(typeof encrypted).toBe('string');
            expect(encrypted).not.toBe(plaintext);
        });

        test('should return different ciphertext for same plaintext (due to random IV)', () => {
            const plaintext = 'test data';
            const encrypted1 = encrypt(plaintext);
            const encrypted2 = encrypt(plaintext);

            expect(encrypted1).not.toBe(encrypted2);
        });

        test('should return encrypted string in correct format (iv:authTag:encrypted)', () => {
            const encrypted = encrypt('test');
            const parts = encrypted.split(':');

            expect(parts).toHaveLength(3);
            expect(parts[0]).toMatch(/^[0-9a-f]+$/); // IV hex
            expect(parts[1]).toMatch(/^[0-9a-f]+$/); // AuthTag hex
            expect(parts[2]).toMatch(/^[0-9a-f]+$/); // Encrypted hex
        });

        test('should handle empty string', () => {
            const encrypted = encrypt('');
            expect(encrypted).toBeDefined();
            expect(typeof encrypted).toBe('string');
        });

        test('should return null for null input', () => {
            const encrypted = encrypt(null);
            expect(encrypted).toBeNull();
        });

        test('should return null for undefined input', () => {
            const encrypted = encrypt(undefined);
            expect(encrypted).toBeNull();
        });

        test('should handle long strings (1000 chars)', () => {
            const longString = 'A'.repeat(1000);
            const encrypted = encrypt(longString);

            expect(encrypted).toBeDefined();
            expect(typeof encrypted).toBe('string');
        });

        test('should handle special characters', () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
            const encrypted = encrypt(specialChars);

            expect(encrypted).toBeDefined();
        });

        test('should handle unicode characters', () => {
            const unicode = '你好世界 🌍 राज कुमार';
            const encrypted = encrypt(unicode);

            expect(encrypted).toBeDefined();
        });

        test('should handle numbers as strings', () => {
            const numberStr = '1234567890';
            const encrypted = encrypt(numberStr);

            expect(encrypted).toBeDefined();
        });
    });

    describe('decrypt() function', () => {
        test('should decrypt encrypted data correctly', () => {
            const plaintext = 'secret message';
            const encrypted = encrypt(plaintext);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        test('should handle empty string encryption/decryption', () => {
            const plaintext = '';
            const encrypted = encrypt(plaintext);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        test('should return null for null input', () => {
            const decrypted = decrypt(null);
            expect(decrypted).toBeNull();
        });

        test('should return null for undefined input', () => {
            const decrypted = decrypt(undefined);
            expect(decrypted).toBeNull();
        });

        test('should throw error for invalid format (missing parts)', () => {
            expect(() => decrypt('invalidformat')).toThrow();
        });

        test('should throw error for invalid format (only 2 parts)', () => {
            expect(() => decrypt('part1:part2')).toThrow();
        });

        test('should throw error for corrupted ciphertext', () => {
            const encrypted = encrypt('test');
            const corrupted = encrypted.slice(0, -5) + 'xxxxx';

            expect(() => decrypt(corrupted)).toThrow();
        });

        test('should throw error for invalid IV', () => {
            const encrypted = encrypt('test');
            const parts = encrypted.split(':');
            const invalidIV = 'zzzz:' + parts[1] + ':' + parts[2];

            expect(() => decrypt(invalidIV)).toThrow();
        });

        test('should handle long encrypted strings', () => {
            const longString = 'A'.repeat(1000);
            const encrypted = encrypt(longString);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(longString);
        });

        test('should handle unicode in encryption/decryption', () => {
            const unicode = '你好 राज 🎉';
            const encrypted = encrypt(unicode);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(unicode);
        });
    });

    describe('hashForSearch() function', () => {
        test('should generate consistent hash for same input', () => {
            const input = 'test value';
            const hash1 = hashForSearch(input);
            const hash2 = hashForSearch(input);

            expect(hash1).toBe(hash2);
        });

        test('should generate different hashes for different inputs', () => {
            const hash1 = hashForSearch('value1');
            const hash2 = hashForSearch('value2');

            expect(hash1).not.toBe(hash2);
        });

        test('should return SHA-256 hash (64 chars)', () => {
            const hash = hashForSearch('test');
            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[0-9a-f]+$/);
        });

        test('should handle empty string', () => {
            const hash = hashForSearch('');
            expect(hash).toBeDefined();
            expect(hash).toHaveLength(64);
        });

        test('should return null for null input', () => {
            const hash = hashForSearch(null);
            expect(hash).toBeNull();
        });

        test('should return null for undefined input', () => {
            const hash = hashForSearch(undefined);
            expect(hash).toBeNull();
        });

        test('should handle long strings', () => {
            const longString = 'A'.repeat(10000);
            const hash = hashForSearch(longString);

            expect(hash).toHaveLength(64);
        });

        test('should handle special characters', () => {
            const hash = hashForSearch('!@#$%^&*()');
            expect(hash).toHaveLength(64);
        });
    });

    describe('maskSensitiveData() function', () => {
        test('should mask string with default 4 visible chars', () => {
            const masked = maskSensitiveData('1234567890');
            expect(masked).toBe('******7890');
        });

        test('should mask with custom visible chars', () => {
            const masked = maskSensitiveData('1234567890', 2);
            expect(masked).toBe('********90');
        });

        test('should handle string shorter than visible chars', () => {
            const masked = maskSensitiveData('123', 5);
            expect(masked).toBe('123');
        });

        test('should handle empty string', () => {
            const masked = maskSensitiveData('');
            expect(masked).toBe('');
        });

        test('should handle null input', () => {
            const masked = maskSensitiveData(null);
            expect(masked).toBeNull();
        });

        test('should handle undefined input', () => {
            const masked = maskSensitiveData(undefined);
            expect(masked).toBeUndefined();
        });

        test('should handle exactly 4 characters', () => {
            const masked = maskSensitiveData('1234');
            expect(masked).toBe('1234');
        });

        test('should handle 5 characters', () => {
            const masked = maskSensitiveData('12345');
            expect(masked).toBe('*2345');
        });

        test('should handle credit card number', () => {
            const masked = maskSensitiveData('1234-5678-9012-3456', 4);
            expect(masked).toBe('***************3456');
        });

        test('should handle Aadhaar number', () => {
            const masked = maskSensitiveData('1234 5678 9012', 4);
            expect(masked).toBe('**********9012');
        });
    });

    describe('Integration: Full encrypt/decrypt cycle', () => {
        test('should maintain data integrity through multiple cycles', () => {
            const original = 'Important Data 123!';

            const encrypted1 = encrypt(original);
            const decrypted1 = decrypt(encrypted1);

            const encrypted2 = encrypt(decrypted1);
            const decrypted2 = decrypt(encrypted2);

            expect(decrypted1).toBe(original);
            expect(decrypted2).toBe(original);
        });

        test('should handle Aadhaar number encryption/decryption', () => {
            const aadhaar = '1234 5678 9012';
            const encrypted = encrypt(aadhaar);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(aadhaar);
            expect(encrypted).not.toContain(aadhaar);
        });

        test('should handle bank account number with masking', () => {
            const accountNumber = '1234567890123456';
            const encrypted = encrypt(accountNumber);
            const decrypted = decrypt(encrypted);
            const masked = maskSensitiveData(decrypted);

            expect(decrypted).toBe(accountNumber);
            expect(masked).toBe('************3456');
        });
    });
});
