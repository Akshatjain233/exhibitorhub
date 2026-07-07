import ConsumerProfile from '../models/ConsumerProfile.js';
import User from '../models/User.js';
import CraftTag from '../models/CraftTag.js';
import ArtisanProfile from '../models/ArtisanProfile.js';

// @desc    Get consumer profile
// @route   GET /api/consumer/profile
// @access  Private (consumer only)
export const getConsumerProfile = async (req, res) => {
    try {
        let profile = await ConsumerProfile.findOne({ user: req.user._id })
            .populate('user', 'name phone_number email preferred_language')
            .populate('craft_preferences', 'name_english name_vernacular type')
            .populate('followed_artisans', 'bio_text location_city craft_specialization is_verified');

        // If consumer profile doesn't exist, create it
        if (!profile) {
            console.log(`Creating consumer profile for user ${req.user._id} during get`);
            profile = await ConsumerProfile.create({
                user: req.user._id,
                selected_interests: []
            });
            // Populate after creation
            await profile.populate('user', 'name phone_number email preferred_language');
            await profile.populate('craft_preferences', 'name_english name_vernacular type');
            await profile.populate('followed_artisans', 'bio_text location_city craft_specialization is_verified');
        }

        res.status(200).json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        console.error('Get consumer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch consumer profile.',
            error: error.message
        });
    }
};

// @desc    Update consumer profile
// @route   PUT /api/consumer/profile
// @access  Private (consumer only)
export const updateConsumerProfile = async (req, res) => {
    try {
        const { selected_interests } = req.body;

        const updateData = {};
        if (selected_interests !== undefined) {
            if (!Array.isArray(selected_interests)) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected interests must be an array.'
                });
            }
            updateData.selected_interests = selected_interests;
        }

        const profile = await ConsumerProfile.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true, runValidators: true, upsert: true }
        ).populate('craft_preferences', 'name_english name_vernacular type');

        res.status(200).json({
            success: true,
            message: 'Consumer profile updated successfully.',
            data: { profile }
        });
    } catch (error) {
        console.error('Update consumer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update consumer profile.',
            error: error.message
        });
    }
};

// @desc    Set craft preferences
// @route   PUT /api/consumer/preferences
// @access  Private (consumer only)
export const updatePreferences = async (req, res) => {
    try {
        const { craft_preferences } = req.body;

        if (!Array.isArray(craft_preferences)) {
            return res.status(400).json({
                success: false,
                message: 'Craft preferences must be an array.'
            });
        }

        // Validate that all IDs are valid MongoDB ObjectIDs
        const mongoose = (await import('mongoose')).default;
        const invalidIds = craft_preferences.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid craft tag IDs provided. Please provide valid CraftTag ObjectIDs from the database (24-character hex strings).'
            });
        }

        // Verify all tags exist
        const validTags = await CraftTag.find({ _id: { $in: craft_preferences } });
        if (validTags.length !== craft_preferences.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more craft tag IDs do not exist in the database. Please verify the CraftTag IDs.'
            });
        }

        const profile = await ConsumerProfile.findOneAndUpdate(
            { user: req.user._id },
            { craft_preferences },
            { new: true, upsert: true }
        ).populate('craft_preferences', 'name_english name_vernacular type');

        res.status(200).json({
            success: true,
            message: 'Craft preferences updated successfully.',
            data: {
                craft_preferences: profile.craft_preferences
            }
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences.',
            error: error.message
        });
    }
};

// @desc    Update interest selection (for onboarding)
// @route   PUT /api/consumer/interests
// @access  Private (consumer only)
export const updateInterests = async (req, res) => {
    try {
        const { selected_interests } = req.body;

        if (!Array.isArray(selected_interests)) {
            return res.status(400).json({
                success: false,
                message: 'Selected interests must be an array.'
            });
        }

        if (selected_interests.length < 1) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least 1 interest.'
            });
        }

        const profile = await ConsumerProfile.findOneAndUpdate(
            { user: req.user._id },
            { selected_interests },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Interests updated successfully.',
            data: {
                selected_interests: profile.selected_interests
            }
        });
    } catch (error) {
        console.error('Update interests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update interests.',
            error: error.message
        });
    }
};

// @desc    Follow an artisan
// @route   POST /api/consumer/follow/:artisanId
// @access  Private (consumer only)
export const followArtisan = async (req, res) => {
    try {
        const { artisanId } = req.params;

        // Only consumers can follow artisans
        if (req.user.role !== 'consumer') {
            return res.status(403).json({
                success: false,
                message: 'Only consumers can follow artisans.'
            });
        }

        let profile = await ConsumerProfile.findOne({ user: req.user._id });

        // If consumer profile doesn't exist, create it
        if (!profile) {
            console.log(`Creating consumer profile for consumer ${req.user._id}`);
            profile = await ConsumerProfile.create({
                user: req.user._id,
                selected_interests: []
            });
        }

        // Check if already following
        if (profile.followed_artisans.includes(artisanId)) {
            return res.status(400).json({
                success: false,
                message: 'Already following this artisan.'
            });
        }

        profile.followed_artisans.push(artisanId);
        await profile.save();

        // Increment followers count on artisan profile
        await ArtisanProfile.findOneAndUpdate(
            { user: artisanId },
            { $inc: { followers_count: 1 } }
        );

        res.status(200).json({
            success: true,
            message: 'Artisan followed successfully.',
            data: {
                followed_artisans: profile.followed_artisans
            }
        });
    } catch (error) {
        console.error('Follow artisan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to follow artisan.',
            error: error.message
        });
    }
};

// @desc    Unfollow an artisan
// @route   DELETE /api/consumer/follow/:artisanId
// @access  Private (consumer only)
export const unfollowArtisan = async (req, res) => {
    try {
        const { artisanId } = req.params;

        // Only consumers can unfollow artisans
        if (req.user.role !== 'consumer') {
            return res.status(403).json({
                success: false,
                message: 'Only consumers can unfollow artisans.'
            });
        }

        let profile = await ConsumerProfile.findOne({ user: req.user._id });

        // If consumer profile doesn't exist, create it
        if (!profile) {
            console.log(`Creating consumer profile for consumer ${req.user._id} during unfollow`);
            profile = await ConsumerProfile.create({
                user: req.user._id,
                selected_interests: []
            });
            return res.status(404).json({
                success: false,
                message: 'Not following this artisan.'
            });
        }

        // Remove from followed artisans
        profile.followed_artisans = profile.followed_artisans.filter(
            id => id.toString() !== artisanId
        );
        await profile.save();

        // Decrement followers count on artisan profile
        await ArtisanProfile.findOneAndUpdate(
            { user: artisanId },
            { $inc: { followers_count: -1 } }
        );

        res.status(200).json({
            success: true,
            message: 'Artisan unfollowed successfully.',
            data: {
                followed_artisans: profile.followed_artisans
            }
        });
    } catch (error) {
        console.error('Unfollow artisan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unfollow artisan.',
            error: error.message
        });
    }
};

// @desc    Get followed artisans
// @route   GET /api/consumer/following
// @access  Private (consumer only)
export const getFollowedArtisans = async (req, res) => {
    try {
        const profile = await ConsumerProfile.findOne({ user: req.user._id })
            .populate({
                path: 'followed_artisans',
                populate: {
                    path: 'user craft_tags',
                    select: 'name preferred_language name_english name_vernacular'
                }
            });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Consumer profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                followed_artisans: profile.followed_artisans
            }
        });
    } catch (error) {
        console.error('Get followed artisans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch followed artisans.',
            error: error.message
        });
    }
};

// @desc    Add address
// @route   POST /api/consumer/address
// @access  Private (consumer only)
export const addAddress = async (req, res) => {
    try {
        const { 
            label, 
            full_address, 
            street, 
            city, 
            state, 
            pincode, 
            postal_code,
            is_default 
        } = req.body;

        // Accept both full_address or street, and pincode or postal_code
        const addressText = full_address || street;
        const postalCode = pincode || postal_code;

        if (!addressText || !city || !state || !postalCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide complete address details (street/full_address, city, state, pincode/postal_code are required).'
            });
        }

        let profile = await ConsumerProfile.findOne({ user: req.user._id });

        // Auto-create consumer profile if it doesn't exist
        if (!profile) {
            console.log(`Creating consumer profile for user ${req.user._id} during addAddress`);
            profile = await ConsumerProfile.create({
                user: req.user._id,
                selected_interests: []
            });
        }

        // If this is set as default, remove default from others
        if (is_default) {
            profile.addresses.forEach(addr => {
                addr.is_default = false;
            });
        }

        profile.addresses.push({
            label,
            full_address: addressText,
            city,
            state,
            pincode: postalCode,
            is_default: is_default || profile.addresses.length === 0
        });

        await profile.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully.',
            data: {
                addresses: profile.addresses
            }
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add address.',
            error: error.message
        });
    }
};

// @desc    Update address
// @route   PUT /api/consumer/address/:addressId
// @access  Private (consumer only)
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { label, full_address, city, state, pincode, is_default } = req.body;

        let profile = await ConsumerProfile.findOne({ user: req.user._id });

        // Auto-create consumer profile if it doesn't exist
        if (!profile) {
            console.log(`Creating consumer profile for user ${req.user._id} during address update`);
            profile = await ConsumerProfile.create({
                user: req.user._id,
                selected_interests: []
            });
        }

        const address = profile.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found.'
            });
        }

        // Update fields
        if (label !== undefined) address.label = label;
        if (full_address !== undefined) address.full_address = full_address;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (pincode !== undefined) address.pincode = pincode;
        
        if (is_default) {
            profile.addresses.forEach(addr => {
                addr.is_default = false;
            });
            address.is_default = true;
        }

        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully.',
            data: {
                addresses: profile.addresses
            }
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update address.',
            error: error.message
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/consumer/address/:addressId
// @access  Private (consumer only)
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        let profile = await ConsumerProfile.findOne({ user: req.user._id });

        // Auto-create consumer profile if it doesn't exist
        if (!profile) {
            console.log(`Creating consumer profile for user ${req.user._id} during address delete`);
            profile = await ConsumerProfile.create({
                user: req.user._id,
                selected_interests: []
            });
            return res.status(404).json({
                success: false,
                message: 'Address not found.'
            });
        }
        profile.addresses.pull(addressId);
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully.',
            data: {
                addresses: profile.addresses
            }
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete address.',
            error: error.message
        });
    }
};

// @desc    Get addresses
// @route   GET /api/consumer/addresses
// @access  Private (consumer only)
export const getAddresses = async (req, res) => {
    try {
        let profile = await ConsumerProfile.findOne({ user: req.user._id })
            .select('addresses');

        // Auto-create consumer profile if it doesn't exist
        if (!profile) {
            console.log(`Creating consumer profile for user ${req.user._id} during getAddresses`);
            profile = await ConsumerProfile.create({
                user: req.user._id,
                selected_interests: []
            });
        }

        res.status(200).json({
            success: true,
            data: {
                addresses: profile?.addresses || []
            }
        });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch addresses.',
            error: error.message
        });
    }
};
