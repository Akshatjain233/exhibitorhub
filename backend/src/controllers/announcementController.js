const announcementService = require('../services/announcementService');
const { successResponse } = require('../utils/response');

exports.createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body);
    return successResponse(res, 201, 'Announcement created successfully', announcement);
  } catch (error) {
    next(error);
  }
};

exports.getAnnouncements = async (req, res, next) => {
  try {
    // If user is visitor or exhibitor, auto-filter their targetAudience
    const query = { ...req.query };
    if (req.user && ['visitor', 'exhibitor'].includes(req.user.role)) {
      query.targetAudience = req.user.role;
      query.status = 'published';
    }
    
    const data = await announcementService.getAnnouncements(query);
    return successResponse(res, 200, 'Announcements retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await announcementService.getAnnouncementById(req.params.id);
    return successResponse(res, 200, 'Announcement retrieved successfully', announcement);
  } catch (error) {
    next(error);
  }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
    return successResponse(res, 200, 'Announcement updated successfully', announcement);
  } catch (error) {
    next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id);
    return successResponse(res, 200, 'Announcement deleted successfully');
  } catch (error) {
    next(error);
  }
};