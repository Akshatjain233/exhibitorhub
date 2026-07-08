import express from 'express';
import { register, login, logout, verifyOTP, resendOTP, updateLanguage, refreshToken } from '../controllers/authController.js';
import { getProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/refresh-token', protect, refreshToken);
router.put('/language', protect, updateLanguage);
router.get('/me', protect, getProfile);
router.put('/change-password', protect, changePassword);

export default router;
