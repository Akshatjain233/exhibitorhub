import encryptionService from '../services/encryptionService.js';
import ConsentLog from '../models/ConsentLog.js';

// @desc    Log user consent
// @route   POST /api/consent
// @access  Private
export const logConsent = async (req, res) => {
    try {
        const { consent_type, consent_version } = req.body;

        const consentLog = await ConsentLog.create({
            user: req.user._id,
            consent_type,
            consent_given: true,
            consent_version,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Consent logged successfully.',
            data: { consentLog },
        });
    } catch (error) {
        console.error('Log consent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to log consent.',
            error: error.message,
        });
    }
};

// @desc    Get user consent history
// @route   GET /api/consent/history
// @access  Private
export const getConsentHistory = async (req, res) => {
    try {
        const consents = await ConsentLog.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { consents },
        });
    } catch (error) {
        console.error('Get consent history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch consent history.',
            error: error.message,
        });
    }
};

// @desc    Revoke consent
// @route   POST /api/consent/revoke
// @access  Private
export const revokeConsent = async (req, res) => {
    try {
        const { consent_type } = req.body;

        const consentLog = await ConsentLog.create({
            user: req.user._id,
            consent_type,
            consent_given: false,
            revoked_at: new Date(),
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
        });

        res.status(200).json({
            success: true,
            message: 'Consent revoked successfully.',
            data: { consentLog },
        });
    } catch (error) {
        console.error('Revoke consent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke consent.',
            error: error.message,
        });
    }
};

// @desc    Request account deletion (GDPR Right to be Forgotten)
// @route   POST /api/consent/delete-account
// @access  Private
export const requestAccountDeletion = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Soft delete - mark for deletion
        user.deletion_requested_at = new Date();
        user.is_active = false;
        await user.save();

        // Log the deletion request
        await ConsentLog.create({
            user: req.user._id,
            consent_type: 'data_processing',
            consent_given: false,
            revoked_at: new Date(),
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
        });

        res.status(200).json({
            success: true,
            message: 'Account deletion requested. Your data will be permanently deleted within 30 days.',
        });
    } catch (error) {
        console.error('Request account deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process deletion request.',
            error: error.message,
        });
    }
};
