import express from 'express';
import {
    register,
    login,
    verifyOTP,
    resendOTP,
    updateLanguage,
    refreshToken,
    logout
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/userAuth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.put('/language', authenticate, updateLanguage);
router.post('/refresh-token', authenticate, refreshToken);
router.post('/logout', authenticate, logout);

export default router;
