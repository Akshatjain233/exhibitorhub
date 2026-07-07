const hallService = require('../services/hallService');
const { successResponse } = require('../utils/response');

exports.createHall = async (req, res, next) => {
  try {
    const hall = await hallService.createHall(req.body);
    return successResponse(res, 201, 'Hall created successfully', hall);
  } catch (error) {
    next(error);
  }
};

exports.getHalls = async (req, res, next) => {
  try {
    const data = await hallService.getHalls(req.query);
    return successResponse(res, 200, 'Halls retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getHallById = async (req, res, next) => {
  try {
    const hall = await hallService.getHallById(req.params.id);
    return successResponse(res, 200, 'Hall retrieved successfully', hall);
  } catch (error) {
    next(error);
  }
};

exports.updateHall = async (req, res, next) => {
  try {
    const hall = await hallService.updateHall(req.params.id, req.body);
    return successResponse(res, 200, 'Hall updated successfully', hall);
  } catch (error) {
    next(error);
  }
};

exports.deleteHall = async (req, res, next) => {
  try {
    await hallService.deleteHall(req.params.id);
    return successResponse(res, 200, 'Hall deleted successfully');
  } catch (error) {
    next(error);
  }
};
