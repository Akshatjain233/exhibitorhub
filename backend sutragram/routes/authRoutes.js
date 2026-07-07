import express from 'express';
import { register, login, logout, verifyOTP, resendOTP, updateLanguage, refreshToken, getAuthStats } from '../controllers/authController.js';
import { getProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/refresh-token', protect, refreshToken);

// Protected routes
router.put('/language', protect, updateLanguage);
router.get('/me/stats', protect, getAuthStats);

// Auth alias routes - frontend expects these under /auth
router.get('/me', protect, getProfile);
router.put('/change-password', protect, changePassword);

export default router;
