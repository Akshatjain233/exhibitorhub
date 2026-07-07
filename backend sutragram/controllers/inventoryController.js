import RawMaterial from '../models/RawMaterial.js';

// @desc    Add raw material to inventory
// @route   POST /api/inventory
// @access  Private (trader seller only)
export const addMaterial = async (req, res) => {
    try {
        const { 
            name, 
            category, 
            description, 
            price_unit, 
            is_organic, 
            images, 
            stock_quantity, 
            unit,
            availability 
        } = req.body;

        if (!name || !price_unit) {
            return res.status(400).json({
                success: false,
                message: 'Name and price_unit are required.',
            });
        }

        const material = await RawMaterial.create({
            seller: req.user._id,
            name,
            category,
            description: description || '',
            price_unit: parseFloat(price_unit),
            is_organic: is_organic || false,
            images: images || [],
            stock_quantity: stock_quantity || 0,
            unit: unit || 'kg',
            availability: availability !== undefined ? availability : true,
        });

        res.status(201).json({
            success: true,
            message: 'Material added to inventory successfully.',
            data: { material },
        });
    } catch (error) {
        console.error('Add material error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add material.',
            error: error.message,
        });
    }
};

// @desc    Get all materials
// @route   GET /api/inventory
// @access  Public
export const getAllMaterials = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (category) {
            query.category = category;
        }
        if (search) {
            query.name = new RegExp(search, 'i');
        }

        const materials = await RawMaterial.find(query)
            .populate('seller', 'name business_name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const normalizedMaterials = materials.map((material) => {
            const doc = material.toObject();
            return {
                ...doc,
                seller: doc.seller || null,
            };
        });

        const total = await RawMaterial.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                materials: normalizedMaterials,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get all materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch materials.',
            error: error.message,
        });
    }
};

// @desc    Get material by ID
// @route   GET /api/inventory/:id
// @access  Private (trader seller only - own materials)
export const getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;

        const material = await RawMaterial.findById(id).populate('seller', 'name business_name');

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found.',
            });
        }

        // Verify ownership
        if (material.seller._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this material.',
            });
        }

        res.status(200).json({
            success: true,
            data: { material },
        });
    } catch (error) {
        console.error('Get material by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch material.',
            error: error.message,
        });
    }
};

// @desc    Update material
// @route   PUT /api/inventory/:id
// @access  Private (trader seller only)
export const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            category, 
            description, 
            price_unit, 
            is_organic, 
            images, 
            stock_quantity, 
            unit,
            availability 
        } = req.body;

        const material = await RawMaterial.findById(id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found.',
            });
        }

        // Verify ownership
        if (material.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this material.',
            });
        }

        // Update fields
        if (name) material.name = name;
        if (category) material.category = category;
        if (description !== undefined) material.description = description;
        if (price_unit !== undefined) material.price_unit = parseFloat(price_unit);
        if (is_organic !== undefined) material.is_organic = is_organic;
        if (images) material.images = images;
        if (stock_quantity !== undefined) material.stock_quantity = stock_quantity;
        if (unit) material.unit = unit;
        if (availability !== undefined) material.availability = availability;

        await material.save();

        res.status(200).json({
            success: true,
            message: 'Material updated successfully.',
            data: { material },
        });
    } catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update material.',
            error: error.message,
        });
    }
};

// @desc    Delete material
// @route   DELETE /api/inventory/:id
// @access  Private (trader seller only)
export const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const material = await RawMaterial.findById(id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found.',
            });
        }

        // Verify ownership
        if (material.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this material.',
            });
        }

        await RawMaterial.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Material deleted successfully.',
        });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete material.',
            error: error.message,
        });
    }
};

// @desc    Get trader seller inventory
// @route   GET /api/inventory/my-materials
// @access  Private (trader seller only)
export const getMyMaterials = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const materials = await RawMaterial.find({ seller: req.user._id })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const normalizedMaterials = materials.map((material) => {
            const doc = material.toObject();
            return {
                ...doc,
                seller: doc.seller || null,
            };
        });

        const total = await RawMaterial.countDocuments({ seller: req.user._id });

        res.status(200).json({
            success: true,
            data: {
                materials: normalizedMaterials,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get my materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch materials.',
            error: error.message,
        });
    }
};

// @desc    Validate material IDs/quantities for trader quote cart
// @route   POST /api/v1/b2b/inventory/validate
// @access  Private (trader only)
export const validateMaterialsForQuote = async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'items must be a non-empty array.',
            });
        }

        const requested = items
            .filter((item) => item?.materialId)
            .map((item) => ({
                materialId: String(item.materialId),
                quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
            }));

        const idRegex = /^[0-9a-fA-F]{24}$/;
        const invalidFormatIds = requested
            .filter((item) => !idRegex.test(item.materialId))
            .map((item) => item.materialId);

        const validFormatIds = requested
            .filter((item) => idRegex.test(item.materialId))
            .map((item) => item.materialId);

        const materials = await RawMaterial.find({ _id: { $in: validFormatIds } })
            .populate('seller', 'name business_name')
            .select('_id name category price_unit unit availability stock_quantity seller');

        const materialMap = new Map(materials.map((m) => [m._id.toString(), m]));

        const validItems = [];
        const invalidIds = [...invalidFormatIds];
        const unavailableItems = [];
        const outOfStockItems = [];

        for (const reqItem of requested) {
            const material = materialMap.get(reqItem.materialId);

            if (!material) {
                invalidIds.push(reqItem.materialId);
                continue;
            }

            if (material.availability === false) {
                unavailableItems.push({
                    materialId: material._id.toString(),
                    name: material.name,
                });
                continue;
            }

            // Enforce stock only when seller explicitly tracks stock (> 0)
            if (material.stock_quantity > 0 && reqItem.quantity > material.stock_quantity) {
                outOfStockItems.push({
                    materialId: material._id.toString(),
                    name: material.name,
                    requestedQuantity: reqItem.quantity,
                    availableQuantity: material.stock_quantity,
                });
                continue;
            }

            validItems.push({
                materialId: material._id.toString(),
                name: material.name,
                category: material.category,
                unitPrice: material.price_unit,
                unit: material.unit || 'unit',
                sellerId: material.seller?._id?.toString() || null,
                sellerName: material.seller?.name || material.seller?.business_name || 'Seller',
                quantity: reqItem.quantity,
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                validItems,
                invalidIds,
                unavailableItems,
                outOfStockItems,
            },
        });
    } catch (error) {
        console.error('Validate materials for quote error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to validate materials.',
            error: error.message,
        });
    }
};
