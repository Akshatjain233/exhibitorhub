const galleryService = require('../services/galleryService');
const { successResponse } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const data = await galleryService.getAll(req.query);
    return successResponse(res, 200, 'Gallerys retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await galleryService.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Gallery retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await galleryService.create(req.body);
    return successResponse(res, 201, 'Gallery created successfully', data);
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await galleryService.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Gallery updated successfully', data);
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await galleryService.delete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Gallery deleted successfully', null);
  } catch (error) { next(error); }
};