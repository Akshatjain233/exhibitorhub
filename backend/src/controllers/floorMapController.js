const floorMapService = require('../services/floorMapService');
const { successResponse } = require('../utils/response');

exports.createFloorMap = async (req, res, next) => {
  try {
    const map = await floorMapService.createFloorMap(req.body);
    return successResponse(res, 201, 'Floor map created successfully', map);
  } catch (error) {
    next(error);
  }
};

exports.getFloorMaps = async (req, res, next) => {
  try {
    const data = await floorMapService.getFloorMaps(req.query);
    return successResponse(res, 200, 'Floor maps retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getFloorMapById = async (req, res, next) => {
  try {
    const map = await floorMapService.getFloorMapById(req.params.id);
    return successResponse(res, 200, 'Floor map retrieved successfully', map);
  } catch (error) {
    next(error);
  }
};

exports.getFloorMapByHall = async (req, res, next) => {
  try {
    const map = await floorMapService.getFloorMapByHall(req.params.hallId);
    return successResponse(res, 200, 'Hall floor map retrieved successfully', map);
  } catch (error) {
    next(error);
  }
};

exports.updateFloorMap = async (req, res, next) => {
  try {
    const map = await floorMapService.updateFloorMap(req.params.id, req.body);
    return successResponse(res, 200, 'Floor map updated successfully', map);
  } catch (error) {
    next(error);
  }
};

exports.deleteFloorMap = async (req, res, next) => {
  try {
    await floorMapService.deleteFloorMap(req.params.id);
    return successResponse(res, 200, 'Floor map deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.assignBoothCoordinates = async (req, res, next) => {
  try {
    const { boothId, coordinates } = req.body;
    const booth = await floorMapService.assignBoothCoordinates(req.params.hallId, boothId, coordinates);
    return successResponse(res, 200, 'Booth coordinates assigned successfully', booth);
  } catch (error) {
    next(error);
  }
};
