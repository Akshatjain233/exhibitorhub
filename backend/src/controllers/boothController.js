const boothService = require('../services/boothService');
const { successResponse } = require('../utils/response');

exports.createBooth = async (req, res, next) => {
  try {
    const booth = await boothService.createBooth(req.body);
    return successResponse(res, 201, 'Booth created successfully', booth);
  } catch (error) {
    next(error);
  }
};

exports.getBooths = async (req, res, next) => {
  try {
    const data = await boothService.getBooths(req.query);
    return successResponse(res, 200, 'Booths retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getAvailableBooths = async (req, res, next) => {
  try {
    const data = await boothService.getAvailableBooths(req.query);
    return successResponse(res, 200, 'Available booths retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getOccupiedBooths = async (req, res, next) => {
  try {
    const data = await boothService.getOccupiedBooths(req.query);
    return successResponse(res, 200, 'Occupied booths retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getBoothById = async (req, res, next) => {
  try {
    const booth = await boothService.getBoothById(req.params.id);
    return successResponse(res, 200, 'Booth retrieved successfully', booth);
  } catch (error) {
    next(error);
  }
};

exports.updateBooth = async (req, res, next) => {
  try {
    const booth = await boothService.updateBooth(req.params.id, req.body);
    return successResponse(res, 200, 'Booth updated successfully', booth);
  } catch (error) {
    next(error);
  }
};

exports.deleteBooth = async (req, res, next) => {
  try {
    await boothService.deleteBooth(req.params.id);
    return successResponse(res, 200, 'Booth deleted successfully');
  } catch (error) {
    next(error);
  }
};
