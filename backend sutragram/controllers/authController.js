import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import ConsumerProfile from '../models/ConsumerProfile.js';
import TraderProfile from '../models/TraderProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';
import AdminProfile from '../models/AdminProfile.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import Workshop from '../models/Workshop.js';
import { sendOTPEmail, sendWelcomeEmail, sendAdminNotification } from '../services/emailService.js';

// In-memory OTP storage (replace with Redis in production)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Send OTP via email using Brevo
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

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
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
            // Role-specific fields
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

        // Validation with detailed error messages
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required and cannot be empty'
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email is required and cannot be empty'
            });
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (!phone_number || !phone_number.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required and cannot be empty'
            });
        }

        if (!password || !password.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Password is required and cannot be empty'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (!role || !role.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Role is required and cannot be empty'
            });
        }

        // Validate role
        const validRoles = ['artisan', 'consumer', 'trader', 'supplier', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified.'
            });
        }
        const normalizedRole = role;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            phone_number,
            password_hash,
                role: normalizedRole,
            preferred_language: preferred_language || 'en'
        });

        // Create role-specific profile
        let profile;
        switch (normalizedRole) {
            case 'artisan':
                const artisanData = {
                    user: user._id,
                    location_city,
                    location_state,
                    location_region,
                    craft_tags: craft_tags || [],
                    craft_specialization
                };

                // Only add location_gps if valid coordinates are provided
                if (location_gps && location_gps.coordinates && Array.isArray(location_gps.coordinates) && location_gps.coordinates.length === 2) {
                    artisanData.location_gps = {
                        type: 'Point',
                        coordinates: location_gps.coordinates
                    };
                }

                profile = await ArtisanProfile.create(artisanData);
                break;

            case 'consumer':
                profile = await ConsumerProfile.create({
                    user: user._id,
                    selected_interests: selected_interests || []
                });
                break;

            case 'trader':
                if (!company_name || !gst_number) {
                    await User.findByIdAndDelete(user._id);
                    return res.status(400).json({
                        success: false,
                        message: 'Company name and GST number are required for traders.'
                    });
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
                    return res.status(400).json({
                        success: false,
                        message: 'Business name is required for suppliers.'
                    });
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
                profile = await AdminProfile.create({
                    user: user._id
                });
                break;
        }

        // Generate OTP
        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // Send OTP via email
        const emailSent = await sendOTP(email, otp, name);
        if (!emailSent) {
            console.error('⚠️ Failed to send OTP email, but user created');
        }

        // Notify admin for new artisan signups
        if (role === 'artisan') {
            try {
                await sendAdminNotification({
                    subject: 'New Artisan Signup',
                    message: `A new artisan has registered and requires verification.`,
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

        // Generate token
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
                profile: profile,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed.',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Update login tracking
        await user.recordLogin();

        // Generate token
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
        res.status(500).json({
            success: false,
            message: 'Login failed.',
            error: error.message
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP.'
            });
        }

        // Get stored OTP
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new OTP.'
            });
        }

        // Check expiration
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP expired. Please request a new OTP.'
            });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.'
            });
        }

        // Update user verification status
        const user = await User.findOneAndUpdate(
            { email },
            { is_email_verified: true },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Clear OTP
        otpStore.delete(email);

        // Send welcome email
        try {
            await sendWelcomeEmail(user.email, user.name, user.role);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }

        // Fetch the role-specific profile so the frontend can hydrate the store fully
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
        res.status(500).json({
            success: false,
            message: 'OTP verification failed.',
            error: error.message
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address.'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        // Send OTP via email
        await sendOTP(email, otp, user.name);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP.',
            error: error.message
        });
    }
};

// @desc    Update language preference
// @route   PUT /api/auth/language
// @access  Private
export const updateLanguage = async (req, res) => {
    try {
        const { preferred_language } = req.body;

        const validLanguages = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];

        if (!preferred_language || !validLanguages.includes(preferred_language)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid language code.'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { preferred_language },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            message: 'Language preference updated.',
            data: {
                preferred_language: user.preferred_language
            }
        });
    } catch (error) {
        console.error('Language update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update language.',
            error: error.message
        });
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
export const refreshToken = async (req, res) => {
    try {
        // Generate new token
        const token = generateToken(req.user._id);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.',
            data: {
                token
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token.',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled client-side by removing the token
        // You could implement a token blacklist here if needed

        res.status(200).json({
            success: true,
            message: 'Logout successful.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed.',
            error: error.message
        });
    }
};

// @desc    Get authenticated user stats (for artisan/user dashboard)
// @route   GET /api/auth/me/stats
// @access  Private
export const getAuthStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Use the 'profile' virtual (defined in User schema) instead of non-existent artisan_profile field
        const user = await User.findById(userId).populate({
            path: 'profile',
            options: { strictPopulate: false },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const profile = user.profile; // Single virtual for any role

        let stats = {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            totalViews: 0,
            totalEarnings: 0,
            totalFollowers: 0,
            totalContent: 0,
            totalOrders: 0,
            totalLeads: 0,
            totalProducts: 0,
            totalWorkshops: 0,
            verified: user.is_verified,
            joinedDate: user.createdAt,
        };

        // Role-specific stats using the generic 'profile' virtual
        if (user.role === 'artisan') {
            if (profile) {
                stats.totalFollowers = profile.followers_count || 0;
                stats.totalEarnings = profile.total_earnings || 0;
                stats.totalLikes = profile.total_likes || 0;
            }

            const [contentCount, productCount, workshopCount, viewsAgg] = await Promise.all([
                Post.countDocuments({ artisan: userId }),
                Product.countDocuments({ artisan: userId }),
                Workshop.countDocuments({ artisan: userId }),
                Post.aggregate([
                    { $match: { artisan: userId } },
                    { $group: { _id: null, totalViews: { $sum: { $max: ['$view_count', '$views_count'] } } } }
                ])
            ]);

            const aggregatedViews = viewsAgg?.[0]?.totalViews ?? 0;

            stats.totalContent = contentCount || 0;
            stats.totalProducts = productCount || 0;
            stats.totalWorkshops = workshopCount || 0;
            stats.totalViews = aggregatedViews > 0 ? aggregatedViews : (profile?.total_views || 0);
        } else if (user.role === 'trader' && profile) {
            stats.totalLeads = profile.leads_unlocked_count || 0;
            stats.totalRevenue = profile.total_revenue || 0;
        }

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get auth stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
            error: error.message
        });
    }
};
