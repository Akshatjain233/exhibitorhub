const exhibitorService = require('../services/exhibitorService');
const { successResponse } = require('../utils/response');

exports.createExhibitor = async (req, res, next) => {
  try {
    const exhibitor = await exhibitorService.createExhibitor(req.body);
    return successResponse(res, 201, 'Exhibitor created successfully', exhibitor);
  } catch (error) {
    next(error);
  }
};

exports.getExhibitors = async (req, res, next) => {
  try {
    const data = await exhibitorService.getExhibitors(req.query);
    return successResponse(res, 200, 'Exhibitors retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getExhibitorById = async (req, res, next) => {
  try {
    const exhibitor = await exhibitorService.getExhibitorById(req.params.id);
    return successResponse(res, 200, 'Exhibitor retrieved successfully', exhibitor);
  } catch (error) {
    next(error);
  }
};

exports.updateExhibitor = async (req, res, next) => {
  try {
    const exhibitor = await exhibitorService.updateExhibitor(req.params.id, req.body, req.user.id, req.user.role);
    return successResponse(res, 200, 'Exhibitor updated successfully', exhibitor);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const exhibitor = await exhibitorService.updateStatus(req.params.id, req.body.status);
    return successResponse(res, 200, 'Exhibitor status updated successfully', exhibitor);
  } catch (error) {
    next(error);
  }
};

exports.assignBooth = async (req, res, next) => {
  try {
    const exhibitor = await exhibitorService.assignBooth(req.params.id, req.body.boothId);
    return successResponse(res, 200, 'Booth assigned successfully', exhibitor);
  } catch (error) {
    next(error);
  }
};

exports.deleteExhibitor = async (req, res, next) => {
  try {
    await exhibitorService.deleteExhibitor(req.params.id);
    return successResponse(res, 200, 'Exhibitor deleted successfully');
  } catch (error) {
    next(error);
  }
};