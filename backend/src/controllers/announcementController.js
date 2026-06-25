const announcementService = require('../services/announcementService');
const { successResponse } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const data = await announcementService.getAll(req.query);
    return successResponse(res, 200, 'Announcements retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await announcementService.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Announcement retrieved successfully', data);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await announcementService.create(req.body);
    return successResponse(res, 201, 'Announcement created successfully', data);
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await announcementService.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Announcement updated successfully', data);
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await announcementService.delete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return successResponse(res, 200, 'Announcement deleted successfully', null);
  } catch (error) { next(error); }
};