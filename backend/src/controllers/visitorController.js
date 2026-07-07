const visitorService = require('../services/visitorService');
const { successResponse } = require('../utils/response');

exports.createVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.createVisitor(req.body);
    return successResponse(res, 201, 'Visitor created successfully', visitor);
  } catch (error) {
    next(error);
  }
};

exports.getVisitors = async (req, res, next) => {
  try {
    const data = await visitorService.getVisitors(req.query);
    return successResponse(res, 200, 'Visitors retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getVisitorById = async (req, res, next) => {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id);
    return successResponse(res, 200, 'Visitor retrieved successfully', visitor);
  } catch (error) {
    next(error);
  }
};

exports.updateVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.updateVisitor(req.params.id, req.body, req.user.id, req.user.role);
    return successResponse(res, 200, 'Visitor updated successfully', visitor);
  } catch (error) {
    next(error);
  }
};

exports.deleteVisitor = async (req, res, next) => {
  try {
    await visitorService.deleteVisitor(req.params.id);
    return successResponse(res, 200, 'Visitor deleted successfully');
  } catch (error) {
    next(error);
  }
};
