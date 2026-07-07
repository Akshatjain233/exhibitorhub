import Product from '../models/Product.js';
import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import ProductComment from '../models/ProductComment.js';
import { createNotification } from './notificationController.js';

const parseBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return !!value;
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (artisan only)
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            category,
            availability,
            customization_options,
            images,
            is_bulk_available,
            bulk_min_quantity,
            bulk_price_per_unit,
            bulk_notes,
        } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Product name and price are required.',
            });
        }

        console.log('Creating product with:', {
            artisan: req.user._id,
            name,
            price,
            category: category || 'General',
            images: images?.length || 0,
        });

        const bulkEnabled = parseBoolean(is_bulk_available);

        const product = await Product.create({
            artisan: req.user._id,
            name,
            price,
            description: description || '',
            category: category || 'General',
            availability: availability !== undefined ? availability : true,
            customization_options: customization_options || {},
            images: images || [],
            is_bulk_available: bulkEnabled,
            bulk_min_quantity: bulkEnabled ? (bulk_min_quantity ?? null) : null,
            bulk_price_per_unit: bulkEnabled ? (bulk_price_per_unit ?? null) : null,
            bulk_notes: bulkEnabled ? (bulk_notes || '') : '',
        });

        console.log('Product created successfully:', {
            _id: product._id.toString(),
            artisan: product.artisan.toString(),
            name: product.name,
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            data: { product },
        });
    } catch (error) {
        console.error('Create product error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product.',
            error: error.message,
        });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:productId
// @access  Public
export const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate MongoDB ObjectId format
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn(`Invalid product ID format: ${productId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format.',
            });
        }

        console.log(`[getProduct] Searching for product ID: ${productId}`);

        const product = await Product.findById(productId)
            .populate('artisan', 'name email phone_number');

        console.log(`[getProduct] Query result:`, product ? 'FOUND' : 'NOT FOUND');

        if (!product) {
            // Debug: Try to see what products exist in database
            const allProductsCount = await Product.countDocuments();
            console.warn(`[getProduct] Product not found. Total products in DB: ${allProductsCount}`);
            
            // Try to find this product without population to debug reference issues
            const rawProduct = await Product.findOne({ _id: productId });
            if (rawProduct) {
                console.warn(`[getProduct] Product exists but populate failed. Artisan ref:`, rawProduct.artisan);
            }
            
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { product },
        });
    } catch (error) {
        console.error('Get product error:', error.message);
        console.error('Get product full error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product.',
            error: error.message,
        });
    }
};

// @desc    Get all products by artisan
// @route   GET /api/products/artisan/:artisanId
// @access  Public
export const getArtisanProducts = async (req, res) => {
    try {
        const { artisanId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Validate MongoDB ObjectId format
        if (!artisanId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid artisan ID format.',
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find({ artisan: artisanId })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance on read queries

        const total = await Product.countDocuments({ artisan: artisanId });

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get artisan products error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products.',
            error: error.message,
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:productId
// @access  Private (artisan only)
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            name,
            price,
            description,
            category,
            availability,
            customization_options,
            images,
            is_bulk_available,
            bulk_min_quantity,
            bulk_price_per_unit,
            bulk_notes,
        } = req.body;

        // Validate MongoDB ObjectId format
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format.',
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        // Verify ownership
        if (product.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product.',
            });
        }

        // Update fields
        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = price;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (availability !== undefined) product.availability = availability;
        if (customization_options !== undefined) product.customization_options = customization_options;
        if (images !== undefined) product.images = images;

        if (is_bulk_available !== undefined) {
            product.is_bulk_available = parseBoolean(is_bulk_available);
        }
        if (bulk_min_quantity !== undefined) {
            product.bulk_min_quantity = bulk_min_quantity;
        }
        if (bulk_price_per_unit !== undefined) {
            product.bulk_price_per_unit = bulk_price_per_unit;
        }
        if (bulk_notes !== undefined) {
            product.bulk_notes = bulk_notes;
        }

        // Keep values consistent when bulk is disabled
        if (!product.is_bulk_available) {
            product.bulk_min_quantity = null;
            product.bulk_price_per_unit = null;
            product.bulk_notes = '';
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
            data: { product },
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product.',
            error: error.message,
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:productId
// @access  Private (artisan only)
export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate MongoDB ObjectId format
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format.',
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        // Verify ownership
        if (product.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product.',
            });
        }

        await Product.findByIdAndDelete(productId);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully.',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product.',
            error: error.message,
        });
    }
};

// @desc    Get curated products for home feed
// @route   GET /api/products/feed
// @access  Public
export const getFeedProducts = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const products = await Product.find({ availability: true })
            .select('_id name price images category artisan likes_count comments_count shares_count')
            .populate('artisan', 'name profile_image_url profile_picture')
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: { products },
        });
    } catch (error) {
        console.error('Get feed products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feed products.',
            error: error.message,
        });
    }
};

// @desc    Like a product
// @route   POST /api/products/:productId/like
// @access  Private
export const likeProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId).populate('artisan', 'name');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        product.likes_count += 1;
        await product.save();

        await ArtisanProfile.findOneAndUpdate(
            { user_id: product.artisan._id },
            { $inc: { total_likes: 1 } },
            { new: true }
        );

        if (product.artisan._id.toString() !== req.user._id.toString()) {
            const io = req.app.get('io');
            await createNotification({
                user: product.artisan._id,
                category: 'like',
                title: 'New Like',
                message: `${req.user.name} liked your product`,
                actor: req.user._id,
                related_entity: {
                    entity_type: 'product',
                    entity_id: product._id,
                },
            }, io);
        }

        res.status(200).json({
            success: true,
            data: { likes_count: product.likes_count },
        });
    } catch (error) {
        console.error('Like product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like product.',
            error: error.message,
        });
    }
};

// @desc    Unlike a product
// @route   POST /api/products/:productId/unlike
// @access  Private
export const unlikeProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        if (product.likes_count > 0) {
            product.likes_count -= 1;
            await product.save();
        }

        res.status(200).json({
            success: true,
            data: { likes_count: product.likes_count },
        });
    } catch (error) {
        console.error('Unlike product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unlike product.',
            error: error.message,
        });
    }
};

// @desc    Share a product (increment share count)
// @route   POST /api/products/:productId/share
// @access  Private
export const shareProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        product.shares_count += 1;
        await product.save();

        await ArtisanProfile.findOneAndUpdate(
            { user_id: product.artisan },
            { $inc: { total_shares: 1 } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: { shares_count: product.shares_count },
        });
    } catch (error) {
        console.error('Share product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share product.',
            error: error.message,
        });
    }
};

// @desc    Get product comments
// @route   GET /api/products/:productId/comments
// @access  Public
export const getProductComments = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const comments = await ProductComment.find({
            product: productId,
            parent_comment: null,
        })
            .populate('user', 'name profile_image_url')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ is_pinned: -1, createdAt: -1 });

        const total = await ProductComment.countDocuments({
            product: productId,
            parent_comment: null,
        });

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get product comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product comments.',
            error: error.message,
        });
    }
};

// @desc    Create a product comment
// @route   POST /api/products/:productId/comments
// @access  Private
export const createProductComment = async (req, res) => {
    try {
        const { productId } = req.params;
        const { text, parent_comment } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required.',
            });
        }

        const product = await Product.findById(productId).populate('artisan', 'name');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        const comment = await ProductComment.create({
            product: productId,
            user: req.user._id,
            text: text.trim(),
            parent_comment: parent_comment || null,
        });

        if (!parent_comment) {
            product.comments_count = (product.comments_count || 0) + 1;
            await product.save();
        }

        if (product.artisan._id.toString() !== req.user._id.toString()) {
            const io = req.app.get('io');
            await createNotification({
                user: product.artisan._id,
                category: 'comment',
                title: 'New Comment',
                message: `${req.user.name} commented on your product`,
                actor: req.user._id,
                related_entity: {
                    entity_type: 'product',
                    entity_id: product._id,
                },
            }, io);
        }

        await comment.populate('user', 'name profile_image_url');

        res.status(201).json({
            success: true,
            data: { comment },
        });
    } catch (error) {
        console.error('Create product comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product comment.',
            error: error.message,
        });
    }
};

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = { availability: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
            ];
        }

        const products = await Product.find(query)
            .populate('artisan', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products.',
            error: error.message,
        });
    }
};
