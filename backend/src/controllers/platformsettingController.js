const platformsettingService = require('../services/platformsettingService');
const { successResponse } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const data = await platformsettingService.getAll(req.query);
    return successResponse(res, 200, 'PlatformSettings retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await platformsettingService.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'PlatformSetting retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await platformsettingService.create(req.body);
    return successResponse(res, 201, 'PlatformSetting created successfully', data);
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await platformsettingService.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'PlatformSetting updated successfully', data);
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await platformsettingService.delete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'PlatformSetting deleted successfully', null);
  } catch (error) { next(error); }
};