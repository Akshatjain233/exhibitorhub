const sponsorService = require('../services/sponsorService');
const { successResponse } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const data = await sponsorService.getAll(req.query);
    return successResponse(res, 200, 'Sponsors retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await sponsorService.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Sponsor retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await sponsorService.create(req.body);
    return successResponse(res, 201, 'Sponsor created successfully', data);
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await sponsorService.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Sponsor updated successfully', data);
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await sponsorService.delete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Sponsor deleted successfully', null);
  } catch (error) { next(error); }
};