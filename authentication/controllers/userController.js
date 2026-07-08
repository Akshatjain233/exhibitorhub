import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import ConsumerProfile from '../models/ConsumerProfile.js';
import TraderProfile from '../models/TraderProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';
import AdminProfile from '../models/AdminProfile.js';

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

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password_hash');

        if (user.profile_picture && !user.profile_image_url) {
            user.profile_image_url = user.profile_picture;
        }

        const ProfileModel = getProfileModel(user.role);
        let profile = null;

        if (ProfileModel) {
            profile = await ProfileModel.findOne({ user: user._id });

            if (user.role === 'artisan' && profile) {
                profile = await ProfileModel.findOne({ user: user._id })
                    .populate('craft_tags', 'name_english name_vernacular type');
            }
        }

        res.status(200).json({ success: true, data: { user, profile } });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile.', error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
        }

        const user = await User.findById(req.user._id);
        const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(new_password, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password.', error: error.message });
    }
};
