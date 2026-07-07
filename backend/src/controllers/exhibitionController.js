const exhibitionService = require('../services/exhibitionService');
const { successResponse } = require('../utils/response');

exports.createExhibition = async (req, res, next) => {
  try {
    const exhibition = await exhibitionService.createExhibition(req.body);
    return successResponse(res, 201, 'Exhibition created successfully', exhibition);
  } catch (error) {
    next(error);
  }
};

exports.getExhibitions = async (req, res, next) => {
  try {
    const data = await exhibitionService.getExhibitions(req.query);
    return successResponse(res, 200, 'Exhibitions retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getExhibitionById = async (req, res, next) => {
  try {
    const exhibition = await exhibitionService.getExhibitionById(req.params.id);
    return successResponse(res, 200, 'Exhibition retrieved successfully', exhibition);
  } catch (error) {
    next(error);
  }
};

exports.updateExhibition = async (req, res, next) => {
  try {
    const exhibition = await exhibitionService.updateExhibition(req.params.id, req.body);
    return successResponse(res, 200, 'Exhibition updated successfully', exhibition);
  } catch (error) {
    next(error);
  }
};

exports.deleteExhibition = async (req, res, next) => {
  try {
    await exhibitionService.deleteExhibition(req.params.id);
    return successResponse(res, 200, 'Exhibition deleted successfully');
  } catch (error) {
    next(error);
  }
};