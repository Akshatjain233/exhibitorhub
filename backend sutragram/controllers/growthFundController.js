import GrowthFundApplication from '../models/GrowthFundApplication.js';
import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';

// @desc    Submit growth fund application
// @route   POST /api/growth-fund/apply
// @access  Private (artisan only)
export const applyForGrowthFund = async (req, res) => {
    try {
        const {
            business_name,
            amount_requested,
            purpose,
            purpose_description,
            current_monthly_revenue,
            expected_impact,
        } = req.body;

        // Validate artisan profile exists
        const artisanProfile = await ArtisanProfile.findOne({ user: req.user._id });
        if (!artisanProfile) {
            return res.status(400).json({
                success: false,
                message: 'Artisan profile not found. Please complete your profile first.',
            });
        }

        // Check if artisan has pending application
        const existingPending = await GrowthFundApplication.findOne({
            artisan: req.user._id,
            status: { $in: ['pending', 'under_review'] },
        });

        if (existingPending) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending application. Please wait for review.',
            });
        }

        // Create application
        const application = await GrowthFundApplication.create({
            artisan: req.user._id,
            business_name,
            amount_requested,
            purpose,
            purpose_description,
            current_monthly_revenue,
            expected_impact,
            status: 'pending',
        });

        await application.populate('artisan', 'name email phone_number');

        res.status(201).json({
            success: true,
            message: 'Growth fund application submitted successfully.',
            data: { application },
        });
    } catch (error) {
        console.error('Apply for growth fund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application.',
            error: error.message,
        });
    }
};

// @desc    Get artisan's own applications
// @route   GET /api/growth-fund/my-applications
// @access  Private (artisan only)
export const getMyApplications = async (req, res) => {
    try {
        const { status } = req.query;
        
        const query = { artisan: req.user._id };
        if (status) {
            query.status = status;
        }

        const applications = await GrowthFundApplication.find(query)
            .sort({ createdAt: -1 })
            .populate('reviewed_by', 'name');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: { applications },
        });
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications.',
            error: error.message,
        });
    }
};

// @desc    Get single application details
// @route   GET /api/growth-fund/applications/:id
// @access  Private (artisan/admin)
export const getApplicationById = async (req, res) => {
    try {
        const application = await GrowthFundApplication.findById(req.params.id)
            .populate('artisan', 'name email phone_number profile_picture')
            .populate('reviewed_by', 'name email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found.',
            });
        }

        // Check authorization (artisan can view own, admin can view all)
        if (req.user.role !== 'admin' && application.artisan._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application.',
            });
        }

        res.status(200).json({
            success: true,
            data: { application },
        });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch application.',
            error: error.message,
        });
    }
};

// @desc    Get all applications (admin)
// @route   GET /api/growth-fund/applications
// @access  Private (admin only)
export const getAllApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) {
            query.status = status;
        }

        const applications = await GrowthFundApplication.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('artisan', 'name email phone_number profile_picture')
            .populate('reviewed_by', 'name');

        const total = await GrowthFundApplication.countDocuments(query);

        // Get statistics
        const stats = await GrowthFundApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount_requested' },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            count: applications.length,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
            stats,
            data: { applications },
        });
    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications.',
            error: error.message,
        });
    }
};

// @desc    Update application status (admin)
// @route   PUT /api/growth-fund/applications/:id/status
// @access  Private (admin only)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, admin_notes, approved_amount } = req.body;

        const application = await GrowthFundApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found.',
            });
        }

        // Update application
        application.status = status;
        if (admin_notes) application.admin_notes = admin_notes;
        if (approved_amount !== undefined) application.approved_amount = approved_amount;
        application.reviewed_by = req.user._id;
        application.reviewed_at = new Date();

        await application.save();

        await application.populate([
            { path: 'artisan', select: 'name email phone_number' },
            { path: 'reviewed_by', select: 'name' },
        ]);

        res.status(200).json({
            success: true,
            message: `Application ${status} successfully.`,
            data: { application },
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update application status.',
            error: error.message,
        });
    }
};

// @desc    Mark application as disbursed (admin)
// @route   PUT /api/growth-fund/applications/:id/disburse
// @access  Private (admin only)
export const markAsDisbursed = async (req, res) => {
    try {
        const { disbursement_method, disbursement_reference } = req.body;

        const application = await GrowthFundApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found.',
            });
        }

        if (application.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Only approved applications can be marked as disbursed.',
            });
        }

        application.status = 'disbursed';
        application.disbursement_date = new Date();
        application.disbursement_method = disbursement_method;
        application.disbursement_reference = disbursement_reference;

        await application.save();

        await application.populate('artisan', 'name email');

        res.status(200).json({
            success: true,
            message: 'Application marked as disbursed.',
            data: { application },
        });
    } catch (error) {
        console.error('Mark as disbursed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark as disbursed.',
            error: error.message,
        });
    }
};

// @desc    Get growth fund statistics (admin)
// @route   GET /api/growth-fund/statistics
// @access  Private (admin only)
export const getGrowthFundStatistics = async (req, res) => {
    try {
        // Total applications by status
        const statusCounts = await GrowthFundApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRequested: { $sum: '$amount_requested' },
                    totalApproved: { $sum: '$approved_amount' },
                },
            },
        ]);

        // Total disbursed amount
        const disbursed = await GrowthFundApplication.aggregate([
            { $match: { status: 'disbursed' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$approved_amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Applications by purpose
        const purposeBreakdown = await GrowthFundApplication.aggregate([
            {
                $group: {
                    _id: '$purpose',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount_requested' },
                },
            },
        ]);

        // Recent applications
        const recentApplications = await GrowthFundApplication.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('artisan', 'name profile_picture');

        res.status(200).json({
            success: true,
            data: {
                statusCounts,
                totalDisbursed: disbursed[0]?.total || 0,
                totalDisbursedCount: disbursed[0]?.count || 0,
                purposeBreakdown,
                recentApplications,
            },
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics.',
            error: error.message,
        });
    }
};
