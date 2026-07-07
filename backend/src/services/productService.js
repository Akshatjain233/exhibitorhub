const productRepository = require('../repositories/productRepository');
const exhibitorRepository = require('../repositories/exhibitorRepository');

class ProductService {
  async createProduct(data, currentUserId, currentUserRole) {
    const exhibitor = await exhibitorRepository.findById(data.exhibitorId);
    if (!exhibitor) {
      const error = new Error('Exhibitor not found');
      error.statusCode = 404;
      throw error;
    }

    if (currentUserRole === 'exhibitor' && exhibitor.userId._id.toString() !== currentUserId) {
      const error = new Error('You can only create products for your own exhibitor profile');
      error.statusCode = 403;
      throw error;
    }

    if (exhibitor.exhibition._id.toString() !== data.exhibition) {
      const error = new Error('Exhibitor is not registered for this exhibition');
      error.statusCode = 400;
      throw error;
    }

    // Auto-approve if created by admin
    if (['super_admin', 'exhibition_admin'].includes(currentUserRole)) {
      data.approvalStatus = 'approved';
    }

    return await productRepository.create(data);
  }

  async getProducts(queryData) {
    const { page = 1, limit = 10, exhibition, exhibitorId, category, featured, approvalStatus, status, search, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (exhibitorId) query.exhibitorId = exhibitorId;
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await productRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await productRepository.count(query);

    return {
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async updateProduct(id, data, currentUserId, currentUserRole) {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (currentUserRole === 'exhibitor' && product.exhibitorId.userId._id.toString() !== currentUserId) {
      const error = new Error('You can only update your own products');
      error.statusCode = 403;
      throw error;
    }

    // Exhibitors cannot change approval status or featured flag
    if (currentUserRole === 'exhibitor') {
      delete data.approvalStatus;
      delete data.featured;
    }

    return await productRepository.update(id, data);
  }

  async updateApprovalStatus(id, approvalStatus) {
    const product = await productRepository.update(id, { approvalStatus });
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async deleteProduct(id, currentUserId, currentUserRole) {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (currentUserRole === 'exhibitor' && product.exhibitorId.userId._id.toString() !== currentUserId) {
      const error = new Error('You can only delete your own products');
      error.statusCode = 403;
      throw error;
    }

    return await productRepository.delete(id);
  }
}

module.exports = new ProductService();