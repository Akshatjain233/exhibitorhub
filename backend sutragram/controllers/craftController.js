import CraftTag from '../models/CraftTag.js';

// @desc    Get all craft categories
// @route   GET /api/crafts
// @access  Public
export const getAllCrafts = async (req, res) => {
    try {
        const { type, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (type) {
            query.type = type;
        }

        const crafts = await CraftTag.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name_english: 1 });

        const total = await CraftTag.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                crafts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get all crafts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch crafts.',
            error: error.message,
        });
    }
};

// @desc    Get craft by ID
// @route   GET /api/crafts/:craftId
// @access  Public
export const getCraftById = async (req, res) => {
    try {
        const { craftId } = req.params;

        const craft = await CraftTag.findById(craftId);

        if (!craft) {
            return res.status(404).json({
                success: false,
                message: 'Craft not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { craft },
        });
    } catch (error) {
        console.error('Get craft by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch craft.',
            error: error.message,
        });
    }
};

// @desc    Create craft category
// @route   POST /api/crafts
// @access  Private (admin only)
export const createCraft = async (req, res) => {
    try {
        const { name_english, name_vernacular, type } = req.body;

        if (!name_english || !type) {
            return res.status(400).json({
                success: false,
                message: 'English name and type are required.',
            });
        }

        const craft = await CraftTag.create({
            name_english,
            name_vernacular: name_vernacular || name_english,
            type,
        });

        res.status(201).json({
            success: true,
            message: 'Craft created successfully.',
            data: { craft },
        });
    } catch (error) {
        console.error('Create craft error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create craft.',
            error: error.message,
        });
    }
};

// @desc    Update craft category
// @route   PUT /api/crafts/:craftId
// @access  Private (admin only)
export const updateCraft = async (req, res) => {
    try {
        const { craftId } = req.params;
        const { name_english, name_vernacular, type } = req.body;

        const craft = await CraftTag.findByIdAndUpdate(
            craftId,
            { name_english, name_vernacular, type },
            { new: true, runValidators: true }
        );

        if (!craft) {
            return res.status(404).json({
                success: false,
                message: 'Craft not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Craft updated successfully.',
            data: { craft },
        });
    } catch (error) {
        console.error('Update craft error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update craft.',
            error: error.message,
        });
    }
};

// @desc    Delete craft category
// @route   DELETE /api/crafts/:craftId
// @access  Private (admin only)
export const deleteCraft = async (req, res) => {
    try {
        const { craftId } = req.params;

        const craft = await CraftTag.findByIdAndDelete(craftId);

        if (!craft) {
            return res.status(404).json({
                success: false,
                message: 'Craft not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Craft deleted successfully.',
        });
    } catch (error) {
        console.error('Delete craft error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete craft.',
            error: error.message,
        });
    }
};
