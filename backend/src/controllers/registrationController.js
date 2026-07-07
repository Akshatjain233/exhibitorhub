const registrationService = require('../services/registrationService');
const { successResponse } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const reg = await registrationService.register(req.body);
    return successResponse(res, 201, 'Registration successful', reg);
  } catch (error) {
    next(error);
  }
};

exports.getRegistrations = async (req, res, next) => {
  try {
    const data = await registrationService.getRegistrations(req.query);
    return successResponse(res, 200, 'Registrations retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getRegistrationById = async (req, res, next) => {
  try {
    const reg = await registrationService.getRegistrationById(req.params.id);
    return successResponse(res, 200, 'Registration retrieved successfully', reg);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const reg = await registrationService.updateStatus(req.params.id, req.body.status);
    return successResponse(res, 200, 'Registration status updated', reg);
  } catch (error) {
    next(error);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const reg = await registrationService.checkIn(req.params.id);
    return successResponse(res, 200, 'Check-in successful', reg);
  } catch (error) {
    next(error);
  }
};

exports.deleteRegistration = async (req, res, next) => {
  try {
    await registrationService.deleteRegistration(req.params.id);
    return successResponse(res, 200, 'Registration deleted successfully');
  } catch (error) {
    next(error);
  }
};
