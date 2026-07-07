const sessionService = require('../services/sessionService');
const { successResponse } = require('../utils/response');

exports.createSession = async (req, res, next) => {
  try {
    const session = await sessionService.createSession(req.body);
    return successResponse(res, 201, 'Session created successfully', session);
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const data = await sessionService.getSessions(req.query);
    return successResponse(res, 200, 'Sessions retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    return successResponse(res, 200, 'Session retrieved successfully', session);
  } catch (error) {
    next(error);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const session = await sessionService.updateSession(req.params.id, req.body);
    return successResponse(res, 200, 'Session updated successfully', session);
  } catch (error) {
    next(error);
  }
};

exports.registerForSession = async (req, res, next) => {
  try {
    const session = await sessionService.registerForSession(req.params.id, req.body.userId || req.user.id);
    return successResponse(res, 200, 'Successfully registered for session', session);
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    await sessionService.deleteSession(req.params.id);
    return successResponse(res, 200, 'Session deleted successfully');
  } catch (error) {
    next(error);
  }
};