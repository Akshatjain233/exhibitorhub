import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import ConsumerProfile from '../models/ConsumerProfile.js';
import TraderProfile from '../models/TraderProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';
import AdminProfile from '../models/AdminProfile.js';
import { sendOTPEmail, sendWelcomeEmail, sendAdminNotification } from '../services/emailService.js';

const otpStore = new Map();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

const sendOTP = async (email, otp, name) => {
    try {
        await sendOTPEmail(email, otp, name);
        console.log(`✅ OTP sent to email: ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send OTP to ${email}:`, error.message);
        return false;
    }
};

export const register = async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        const {
            name,
            email,
            phone_number,
            password,
            role,
            preferred_language,
            location_city,
            location_state,
            location_region,
            location_gps,
            craft_tags,
            craft_specialization,
            selected_interests,
            company_name,
            gst_number,
            business_type,
            can_supply_materials,
            business_name,
            material_types,
            operating_regions,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Name is required and cannot be empty' });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Email is required and cannot be empty' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        if (!phone_number || !phone_number.trim()) {
            return res.status(400).json({ success: false, message: 'Phone number is required and cannot be empty' });
        }

        if (!password || !password.trim()) {
            return res.status(400).json({ success: false, message: 'Password is required and cannot be empty' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        if (!role || !role.trim()) {
            return res.status(400).json({ success: false, message: 'Role is required and cannot be empty' });
        }

        const validRoles = ['artisan', 'consumer', 'trader', 'supplier', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role specified.' });
        }
        const normalizedRole = role;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            phone_number,
            password_hash,
            role: normalizedRole,
            preferred_language: preferred_language || 'en'
        });

        let profile;
        switch (normalizedRole) {
            case 'artisan': {
                const artisanData = {
                    user: user._id,
                    location_city,
                    location_state,
                    location_region,
                    craft_tags: craft_tags || [],
                    craft_specialization
                };

                if (location_gps && location_gps.coordinates && Array.isArray(location_gps.coordinates) && location_gps.coordinates.length === 2) {
                    artisanData.location_gps = {
                        type: 'Point',
                        coordinates: location_gps.coordinates
                    };
                }

                profile = await ArtisanProfile.create(artisanData);
                break;
            }
            case 'consumer':
                profile = await ConsumerProfile.create({
                    user: user._id,
                    selected_interests: selected_interests || []
                });
                break;
            case 'trader':
                if (!company_name || !gst_number) {
                    await User.findByIdAndDelete(user._id);
                    return res.status(400).json({ success: false, message: 'Company name and GST number are required for traders.' });
                }
                profile = await TraderProfile.create({
                    user: user._id,
                    company_name,
                    gst_number,
                    business_type: business_type || 'wholesaler',
                    can_supply_materials: Boolean(can_supply_materials),
                });
                break;
            case 'supplier':
                if (!business_name) {
                    await User.findByIdAndDelete(user._id);
                    return res.status(400).json({ success: false, message: 'Business name is required for suppliers.' });
                }
                profile = await SupplierProfile.create({
                    user: user._id,
                    business_name,
                    gst_number,
                    business_type: business_type || 'raw_material_supplier',
                    material_types: Array.isArray(material_types) ? material_types : [],
                    operating_regions: Array.isArray(operating_regions) ? operating_regions : [],
                });
                break;
            case 'admin':
                profile = await AdminProfile.create({ user: user._id });
                break;
        }

        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        const emailSent = await sendOTP(email, otp, name);
        if (!emailSent) {
            console.error('⚠️ Failed to send OTP email, but user created');
        }

        if (role === 'artisan') {
            try {
                await sendAdminNotification({
                    subject: 'New Artisan Signup',
                    message: 'A new artisan has registered and requires verification.',
                    details: {
                        name,
                        email,
                        phone_number,
                        craft_specialization,
                        location_city,
                        location_state,
                        registered_at: new Date().toISOString(),
                    },
                });
            } catch (err) {
                console.error('Failed to send admin notification:', err);
            }
        }

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful. OTP sent to your email.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    preferred_language: user.preferred_language,
                    is_email_verified: user.is_email_verified
                },
                profile,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        await user.recordLogin();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone_number: user.phone_number,
                    role: user.role,
                    preferred_language: user.preferred_language,
                    is_email_verified: user.is_email_verified,
                    last_login: user.last_login
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and OTP.' });
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new OTP.' });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        const user = await User.findOneAndUpdate(
            { email },
            { is_email_verified: true },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        otpStore.delete(email);

        try {
            await sendWelcomeEmail(user.email, user.name, user.role);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }

        let profile = null;
        try {
            if (user.role === 'artisan') {
                profile = await ArtisanProfile.findOne({ user: user._id });
            } else if (user.role === 'consumer') {
                profile = await ConsumerProfile.findOne({ user: user._id });
            } else if (user.role === 'trader') {
                profile = await TraderProfile.findOne({ user: user._id });
            } else if (user.role === 'admin') {
                profile = await AdminProfile.findOne({ user: user._id });
            }
        } catch (e) {
            console.error('Failed to fetch profile after OTP verify:', e);
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    preferred_language: user.preferred_language,
                    is_email_verified: user.is_email_verified
                },
                profile,
                token
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ success: false, message: 'OTP verification failed.', error: error.message });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide email address.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        await sendOTP(email, otp, user.name);

        res.status(200).json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP.', error: error.message });
    }
};

export const updateLanguage = async (req, res) => {
    try {
        const { preferred_language } = req.body;
        const validLanguages = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];

        if (!preferred_language || !validLanguages.includes(preferred_language)) {
            return res.status(400).json({ success: false, message: 'Invalid language code.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { preferred_language },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            message: 'Language preference updated.',
            data: { preferred_language: user.preferred_language }
        });
    } catch (error) {
        console.error('Language update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update language.', error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = generateToken(req.user._id);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.',
            data: { token }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ success: false, message: 'Failed to refresh token.', error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: 'Logout successful.' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Logout failed.', error: error.message });
    }
};
