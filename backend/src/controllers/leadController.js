const leadService = require('../services/leadService');
const { successResponse } = require('../utils/response');

exports.scanLead = async (req, res, next) => {
  try {
    const lead = await leadService.scanLead(req.body, req.user.id);
    return successResponse(res, 201, 'Lead scanned successfully', lead);
  } catch (error) {
    next(error);
  }
};

exports.getLeads = async (req, res, next) => {
  try {
    const data = await leadService.getLeads(req.query, req.user.id, req.user.role);
    return successResponse(res, 200, 'Leads retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 200, 'Lead retrieved successfully', lead);
  } catch (error) {
    next(error);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body, req.user.id, req.user.role);
    return successResponse(res, 200, 'Lead updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    await leadService.deleteLead(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 200, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.exportLeads = async (req, res, next) => {
  try {
    const leads = await leadService.exportLeads(req.query, req.user.id, req.user.role);
    // Simple JSON response for now. A real app would format to CSV and set headers.
    return successResponse(res, 200, 'Leads exported successfully', leads);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    if (!req.query.exhibition) {
      return res.status(400).json({ success: false, message: 'Exhibition ID is required' });
    }
    // Need to cast to Object Id in aggregate, so passing string is fine if repository handles it or we can ignore. Mongoose match uses auto-cast if properly set up but we pass string directly. If it fails, we will need `mongoose.Types.ObjectId(exhibitionId)`
    const stats = await leadService.getDashboardStats(req.query.exhibition, req.user.id, req.user.role);
    return successResponse(res, 200, 'Lead stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
