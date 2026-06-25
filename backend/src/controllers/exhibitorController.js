const exhibitorService = require('../services/exhibitorService');
const { successResponse } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const data = await exhibitorService.getAll(req.query);
    return successResponse(res, 200, 'Exhibitors retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await exhibitorService.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Exhibitor retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await exhibitorService.create(req.body);
    return successResponse(res, 201, 'Exhibitor created successfully', data);
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await exhibitorService.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Exhibitor updated successfully', data);
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await exhibitorService.delete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Exhibitor deleted successfully', null);
  } catch (error) { next(error); }
};