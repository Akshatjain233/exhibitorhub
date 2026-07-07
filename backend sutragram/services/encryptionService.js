import crypto from 'crypto';

// AES-256 Encryption Service for PII (Personally Identifiable Information)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32); // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:authTag:encrypted
 */
export const encrypt = (text) => {
    if (text === null || text === undefined) return null;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Return: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypts AES-256-GCM encrypted data
 * @param {string} encryptedData - Encrypted text in format: iv:authTag:encrypted
 * @returns {string} - Decrypted plain text
 */
export const decrypt = (encryptedData) => {
    if (encryptedData === null || encryptedData === undefined) return null;

    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Hash sensitive data for comparison (one-way, irreversible)
 * Useful for searching encrypted fields without decrypting them
 * @param {string} text - Text to hash
 * @returns {string} - SHA-256 hash
 */
export const hashForSearch = (text) => {
    if (text === null || text === undefined) return null;
    return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Mask sensitive data for display (e.g., **** **** 1234)
 * @param {string} value - Value to mask
 * @param {number} visibleChars - Number of characters to show at the end
 * @returns {string} - Masked value
 */
export const maskSensitiveData = (value, visibleChars = 4) => {
    if (!value || value.length <= visibleChars) return value;
    const masked = '*'.repeat(value.length - visibleChars);
    return masked + value.slice(-visibleChars);
};

export default {
    encrypt,
    decrypt,
    hashForSearch,
    maskSensitiveData,
};
