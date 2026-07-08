import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers?.authorization || req.header?.('Authorization');
        const token = authHeader?.toLowerCase().startsWith('bearer ')
            ? authHeader.slice(7).trim()
            : null;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const secret = process.env.JWT_SECRET || 'test-secret';
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (error) {
            throw error;
        }

        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.error('🔐 JWT Verification Error:', error.message);
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            console.error('🔐 Token Expired:', error.message);
            return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
        }
        console.error('🔐 Authentication Error:', error.message);
        res.status(500).json({ success: false, message: 'Authentication error.', error: error.message });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ success: false, message: 'Access denied. No permission — please authenticate first.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `Access denied. Insufficient permission. Required role: ${roles.join(' or ')}` });
        }

        next();
    };
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers?.authorization || req.header?.('Authorization');
        const token = authHeader?.toLowerCase().startsWith('bearer ')
            ? authHeader.slice(7).trim()
            : null;

        if (token) {
            const secret = process.env.JWT_SECRET || 'test-secret';
            try {
                const decoded = jwt.verify(token, secret);
                const userId = decoded.userId || decoded.id;
                const user = await User.findById(userId);

                if (user && user.is_active) {
                    req.user = user;
                }
            } catch (verifyError) {
                console.warn('Optional auth token is invalid:', verifyError.message);
            }
        }

        next();
    } catch (error) {
        next();
    }
};
