import bcrypt from 'bcryptjs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import fs from 'fs/promises';
import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import ConsumerProfile from '../models/ConsumerProfile.js';
import TraderProfile from '../models/TraderProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';
import AdminProfile from '../models/AdminProfile.js';
import { s3Client } from '../config/s3.js';

// Helper function to get profile model
const getProfileModel = (role) => {
    const models = {
        artisan: ArtisanProfile,
        consumer: ConsumerProfile,
        trader: TraderProfile,
        supplier: SupplierProfile,
        admin: AdminProfile
    };
    return models[role];
};

// @desc    Get current user profile
// @route   GET /api/user/me
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password_hash');
        
        // Normalize profile_picture to profile_image_url for frontend consistency
        if (user.profile_picture && !user.profile_image_url) {
            user.profile_image_url = user.profile_picture;
        }
        
        // Get role-specific profile
        const ProfileModel = getProfileModel(user.role);
        let profile = null;
        
        if (ProfileModel) {
            profile = await ProfileModel.findOne({ user: user._id });
            
            // Only populate craft_tags for artisan profiles
            if (user.role === 'artisan' && profile) {
                profile = await ProfileModel.findOne({ user: user._id })
                    .populate('craft_tags', 'name_english name_vernacular type');
            }
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile.',
            error: error.message
        });
    }
};

// @desc    Update user basic information
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, email, preferred_language } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (preferred_language) updateData.preferred_language = preferred_language;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password_hash');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile.',
            error: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password.'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id);

        // Verify current password
        const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(new_password, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully.'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password.',
            error: error.message
        });
    }
};

// @desc    Update account settings
// @route   PUT /api/user/settings
// @access  Private
export const updateSettings = async (req, res) => {
    try {
        const { preferred_language } = req.body;

        const updateData = {};
        if (preferred_language) {
            const validLanguages = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];
            if (!validLanguages.includes(preferred_language)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid language code.'
                });
            }
            updateData.preferred_language = preferred_language;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password_hash');

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully.',
            data: { user }
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings.',
            error: error.message
        });
    }
};

// @desc    Deactivate account
// @route   PUT /api/user/deactivate
// @access  Private
export const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { is_active: false },
            { new: true }
        ).select('-password_hash');

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully.',
            data: { user }
        });
    } catch (error) {
        console.error('Deactivate account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate account.',
            error: error.message
        });
    }
};

// @desc    Request data deletion
// @route   POST /api/user/request-deletion
// @access  Private
export const requestDataDeletion = async (req, res) => {
    try {
        // In production, this would create a deletion request for admin review
        // and schedule data deletion after the legal retention period
        
        const user = await User.findById(req.user._id);
        
        // Create deletion request (you'd save this to a DeletionRequest model)
        const deletionRequest = {
            userId: user._id,
            requestedAt: new Date(),
            scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'pending'
        };

        // For now, just return success
        res.status(200).json({
            success: true,
            message: 'Data deletion requested. Your data will be deleted within 30 days.',
            data: {
                scheduledDeletionDate: deletionRequest.scheduledDeletionDate
            }
        });
    } catch (error) {
        console.error('Request deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to request data deletion.',
            error: error.message
        });
    }
};

// @desc    Delete account permanently
// @route   DELETE /api/user/account
// @access  Private
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your password to confirm deletion.'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id);

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password.'
            });
        }

        // Delete role-specific profile
        const ProfileModel = getProfileModel(user.role);
        if (ProfileModel) {
            await ProfileModel.findOneAndDelete({ user: user._id });
        }

        // Delete user
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            success: true,
            message: 'Account deleted permanently.'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account.',
            error: error.message
        });
    }
};

// @desc    Get public profile
// @route   GET /api/user/:userId/public-profile
// @access  Public
export const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('name role preferred_language is_active');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (!user.is_active) {
            return res.status(404).json({
                success: false,
                message: 'User account is deactivated.'
            });
        }

        // Get role-specific profile
        const ProfileModel = getProfileModel(user.role);
        let profile = null;
        
        if (ProfileModel) {
            profile = await ProfileModel.findOne({ user: user._id })
                .populate('craft_tags', 'name_english name_vernacular type');
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile.',
            error: error.message
        });
    }
};

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
    try {
        console.log('📸 Upload request received:', {
            hasFiles: !!req.files,
            filesKeys: req.files ? Object.keys(req.files) : [],
            hasProfilePicture: req.files?.profile_picture ? true : false,
            userId: req.user?._id,
        });

        if (!req.files || !req.files.profile_picture) {
            console.error('❌ No file found in request:', {
                files: req.files,
                body: req.body,
                headers: req.headers,
            });
            return res.status(400).json({
                success: false,
                message: 'Please upload a profile picture.',
            });
        }

        const file = req.files.profile_picture;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Only JPEG, PNG and WebP images are allowed.',
            });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File size must be less than 5MB.',
            });
        }

        // Upload to DigitalOcean Spaces (S3)
        const userId = req.user._id.toString();
        const timestamp = Date.now();
        const bucketKey = `profiles/${userId}/${timestamp}-${uuid()}.jpg`;
        const cdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT || `https://${process.env.DO_SPACES_BUCKET}.sgp1.cdn.digitaloceanspaces.com`;
        
        console.log('📤 Uploading to DO Spaces:', {
            bucket: process.env.DO_SPACES_BUCKET,
            key: bucketKey,
            cdnEndpoint,
            fileSize: file.size,
            mimeType: file.mimetype,
            tempFilePath: file.tempFilePath
        });
        
        try {
            // Read the file from temp location (express-fileupload uses tempFiles)
            const fileBuffer = await fs.readFile(file.tempFilePath);
            console.log('📖 File buffer size:', fileBuffer.length);
            
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: process.env.DO_SPACES_BUCKET,
                    Key: bucketKey,
                    Body: fileBuffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read', // Make the file publicly accessible
                    CacheControl: 'max-age=31536000', // Cache for 1 year since filename has UUID
                })
            );
            console.log('✅ File uploaded successfully to DO Spaces');
            
            // Clean up temp file
            await fs.unlink(file.tempFilePath).catch(err => 
                console.warn('⚠️ Failed to delete temp file:', err.message)
            );
        } catch (s3Error) {
            console.error('S3 upload error:', s3Error);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload to storage service.',
                error: s3Error.message,
            });
        }
        
        const imageUrl = `${cdnEndpoint}/${bucketKey}`;
        
        console.log('🔗 Generated image URL:', imageUrl);

        // Update user profile picture — save to BOTH profile_picture (legacy) and profile_image_url (standard)
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { 
                profile_picture: imageUrl,
                profile_image_url: imageUrl
            },
            { new: true }
        ).select('-password_hash');

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully.',
            data: {
                profile_picture: imageUrl,
                user
            }
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture.',
            error: error.message,
        });
    }
};
