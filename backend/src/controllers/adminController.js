const adminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/response');

exports.getSystemHealth = (req, res, next) => {
    try {
        const health = adminService.getHealthSnapshot();
        return successResponse(res, 200, 'System health retrieved', health);
    } catch (error) { next(error); }
};

exports.getDashboardStats = async (req, res, next) => {
    try {
        const stats = await adminService.getDashboardStats();
        return successResponse(res, 200, 'Dashboard stats retrieved', stats);
    } catch (error) { next(error); }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const result = await adminService.getAllUsers(req.query);
        return successResponse(res, 200, 'Users retrieved', result);
    } catch (error) { next(error); }
};

exports.toggleUserActive = async (req, res, next) => {
    try {
        const user = await adminService.toggleUserActive(req.params.userId);
        if (!user) return errorResponse(res, 404, 'User not found');
        return successResponse(res, 200, `User ${user.is_active ? 'activated' : 'deactivated'} successfully`, user);
    } catch (error) { next(error); }
};

exports.getPendingVerifications = async (req, res, next) => {
    try {
        const result = await adminService.getPendingVerifications(req.query.page, req.query.limit);
        return successResponse(res, 200, 'Pending verifications retrieved', result);
    } catch (error) { next(error); }
};

exports.verifyExhibitor = async (req, res, next) => {
    try {
        const exhibitor = await adminService.verifyExhibitor(req.params.id);
        if (!exhibitor) return errorResponse(res, 404, 'Exhibitor not found');
        return successResponse(res, 200, 'Exhibitor verified successfully', exhibitor);
    } catch (error) { next(error); }
};

exports.verifyProduct = async (req, res, next) => {
    try {
        const product = await adminService.verifyProduct(req.params.id);
        if (!product) return errorResponse(res, 404, 'Product not found');
        return successResponse(res, 200, 'Product verified successfully', product);
    } catch (error) { next(error); }
};
