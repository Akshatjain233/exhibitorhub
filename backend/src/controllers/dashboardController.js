const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/response');

exports.getDashboard = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const exhibitionId = req.query.exhibition; // Required for most dashboards except super admin

    let dashboardData;

    switch (role) {
      case 'super_admin':
        dashboardData = await dashboardService.getSuperAdminDashboard();
        break;
      case 'exhibition_admin':
        dashboardData = await dashboardService.getExhibitionAdminDashboard(exhibitionId);
        break;
      case 'exhibitor':
        dashboardData = await dashboardService.getExhibitorDashboard(exhibitionId, id);
        break;
      case 'visitor':
        dashboardData = await dashboardService.getVisitorDashboard(exhibitionId, id);
        break;
      default:
        return res.status(403).json({ success: false, message: 'Invalid role for dashboard' });
    }

    return successResponse(res, 200, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    if (error.message.includes('required')) {
      error.statusCode = 400;
    }
    next(error);
  }
};
