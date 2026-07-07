const productService = require('../services/productService');
const { successResponse } = require('../utils/response');

exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user.id, req.user.role);
    return successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const data = await productService.getProducts(req.query);
    return successResponse(res, 200, 'Products retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.user.id, req.user.role);
    return successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

exports.updateApprovalStatus = async (req, res, next) => {
  try {
    const product = await productService.updateApprovalStatus(req.params.id, req.body.approvalStatus);
    return successResponse(res, 200, 'Product approval status updated', product);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};