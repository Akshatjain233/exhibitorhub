import ArtisanProfile from '../models/ArtisanProfile.js';
import TraderProfile from '../models/TraderProfile.js';
import { createNotification } from './notificationController.js';

// @desc    Get pending verifications
// @route   GET /api/verification/pending
// @access  Private (admin only)
export const getPendingVerifications = async (req, res) => {
    try {
        const { type = 'artisan', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let profiles;
        let Model;

        switch (type) {
            case 'artisan':
                Model = ArtisanProfile;
                break;
            case 'trader':
                Model = TraderProfile;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification type.',
                });
        }

        profiles = await Model.find({ verification_status: 'submitted' })
            .populate('user', 'name email phone_number')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Model.countDocuments({ verification_status: 'submitted' });

        res.status(200).json({
            success: true,
            data: {
                profiles,
                type,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending verifications.',
            error: error.message,
        });
    }
};

// @desc    Approve verification
// @route   PUT /api/verification/approve/:profileId
// @access  Private (admin only)
export const approveVerification = async (req, res) => {
    try {
        const { profileId, id } = req.params;
        const resolvedProfileId = profileId || id;
        const { type = 'artisan' } = req.body;

        let Model;
        switch (type) {
            case 'artisan':
                Model = ArtisanProfile;
                break;
            case 'trader':
                Model = TraderProfile;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification type.',
                });
        }

        const profile = await Model.findByIdAndUpdate(
            resolvedProfileId,
            {
                is_verified: true,
                verification_status: 'approved',
                verification_date: new Date(),
            },
            { new: true }
        ).populate('user');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found.',
            });
        }

        // Send notification
        await createNotification(
            profile.user._id,
            'in_app',
            'verification',
            'Verification Approved',
            'Congratulations! Your account has been verified.',
            { profile_type: type }
        );

        res.status(200).json({
            success: true,
            message: 'Verification approved successfully.',
            data: { profile },
        });
    } catch (error) {
        console.error('Approve verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve verification.',
            error: error.message,
        });
    }
};

// @desc    Reject verification
// @route   PUT /api/verification/reject/:profileId
// @access  Private (admin only)
export const rejectVerification = async (req, res) => {
    try {
        const { profileId, id } = req.params;
        const resolvedProfileId = profileId || id;
        const { type = 'artisan', reason } = req.body;

        let Model;
        switch (type) {
            case 'artisan':
                Model = ArtisanProfile;
                break;
            case 'trader':
                Model = TraderProfile;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification type.',
                });
        }

        const profile = await Model.findByIdAndUpdate(
            resolvedProfileId,
            {
                verification_status: 'rejected',
            },
            { new: true }
        ).populate('user');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found.',
            });
        }

        // Send notification
        await createNotification(
            profile.user._id,
            'in_app',
            'verification',
            'Verification Rejected',
            reason || 'Your verification was rejected. Please resubmit with valid documents.',
            { profile_type: type }
        );

        res.status(200).json({
            success: true,
            message: 'Verification rejected successfully.',
            data: { profile },
        });
    } catch (error) {
        console.error('Reject verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject verification.',
            error: error.message,
        });
    }
};

// @desc    Get verification details
// @route   GET /api/verification/:profileId
// @access  Private (admin only)
export const getVerificationDetails = async (req, res) => {
    try {
        const { profileId, id } = req.params;
        const resolvedProfileId = profileId || id;
        const { type = 'artisan' } = req.query;

        let Model;
        switch (type) {
            case 'artisan':
                Model = ArtisanProfile;
                break;
            case 'trader':
                Model = TraderProfile;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification type.',
                });
        }

        const profile = await Model.findById(resolvedProfileId)
            .populate('user', 'name email phone_number')
            .populate('craft_tags', 'name_english name_vernacular');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { profile },
        });
    } catch (error) {
        console.error('Get verification details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verification details.',
            error: error.message,
        });
    }
};
