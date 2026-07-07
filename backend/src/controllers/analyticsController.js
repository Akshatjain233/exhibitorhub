const analyticsService = require('../services/analyticsService');
const exhibitorRepository = require('../repositories/exhibitorRepository');
const { successResponse } = require('../utils/response');

exports.trackView = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    await analyticsService.trackView(req.body, userId, ipAddress, userAgent);
    // Don't need to return data, just 201 created or 200 ok
    return successResponse(res, 200, 'View tracked');
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const exhibitionId = req.query.exhibition;

    if (!exhibitionId) {
      return res.status(400).json({ success: false, message: 'Exhibition ID is required' });
    }

    let analyticsData;

    if (role === 'super_admin' || role === 'exhibition_admin') {
      analyticsData = await analyticsService.getExhibitionAnalytics(exhibitionId);
    } else if (role === 'exhibitor') {
      const exhibitor = await exhibitorRepository.findOne({ userId: id, exhibition: exhibitionId });
      if (!exhibitor) {
        return res.status(403).json({ success: false, message: 'Exhibitor profile not found' });
      }
      analyticsData = await analyticsService.getExhibitorAnalytics(exhibitionId, exhibitor._id);
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized to view analytics' });
    }

    return successResponse(res, 200, 'Analytics retrieved', analyticsData);
  } catch (error) {
    next(error);
  }
};
