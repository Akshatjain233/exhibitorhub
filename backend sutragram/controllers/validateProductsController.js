import Product from '../models/Product.js';

/**
 * @desc    Validate which products exist in database
 * @route   POST /api/products/validate
 * @access  Public (used by checkout to clean up stale cart data)
 * 
 * Request body:
 * {
 *   productIds: ['id1', 'id2', 'id3']
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     validIds: ['id1', 'id3'],
 *     invalidIds: ['id2'],
 *     total: 3,
 *     valid: 2,
 *     invalid: 1
 *   }
 * }
 */
export const validateProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'productIds must be a non-empty array.',
            });
        }

        // Filter out invalid MongoDB ObjectId formats
        const validMongoIds = productIds.filter(id => id.match(/^[0-9a-fA-F]{24}$/));
        const invalidFormatIds = productIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));

        // Check which valid IDs exist in database
        const existingProducts = await Product.find({
            _id: { $in: validMongoIds }
        }).select('_id');

        const existingIds = new Set(existingProducts.map(p => p._id.toString()));
        const validIds = validMongoIds.filter(id => existingIds.has(id));
        const invalidIds = [
            ...invalidFormatIds,
            ...validMongoIds.filter(id => !existingIds.has(id))
        ];

        console.log('🔍 [validateProducts] Validation result:', {
            total: productIds.length,
            valid: validIds.length,
            invalid: invalidIds.length,
            invalidFormatCount: invalidFormatIds.length,
            notFoundCount: validMongoIds.length - validIds.length,
        });

        res.status(200).json({
            success: true,
            data: {
                validIds,
                invalidIds,
                total: productIds.length,
                valid: validIds.length,
                invalid: invalidIds.length,
            },
        });
    } catch (error) {
        console.error('❌ Validate products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate products.',
            error: error.message,
        });
    }
};
