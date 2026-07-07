const qrPassService = require('../services/qrPassService');
const { successResponse } = require('../utils/response');

exports.generateQRPass = async (req, res, next) => {
  try {
    const pass = await qrPassService.generateQRPass(req.body);
    return successResponse(res, 201, 'QR Pass generated successfully', pass);
  } catch (error) {
    next(error);
  }
};

exports.getQRPasses = async (req, res, next) => {
  try {
    const data = await qrPassService.getQRPasses(req.query);
    return successResponse(res, 200, 'QR Passes retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getQRPassById = async (req, res, next) => {
  try {
    const pass = await qrPassService.getQRPassById(req.params.id);
    return successResponse(res, 200, 'QR Pass retrieved successfully', pass);
  } catch (error) {
    next(error);
  }
};

exports.regenerateQRPass = async (req, res, next) => {
  try {
    const pass = await qrPassService.regenerateQRPass(req.params.id);
    return successResponse(res, 200, 'QR Pass regenerated successfully', pass);
  } catch (error) {
    next(error);
  }
};

exports.validateQR = async (req, res, next) => {
  try {
    const pass = await qrPassService.validateQR(req.body.qr_code_data);
    return successResponse(res, 200, 'QR Code is valid', pass);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const pass = await qrPassService.updateStatus(req.params.id, req.body.status);
    return successResponse(res, 200, 'QR Pass status updated', pass);
  } catch (error) {
    next(error);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const pass = await qrPassService.checkIn(req.body.qr_code_data, req.user.id, req.body.location);
    return successResponse(res, 200, 'Check-in recorded successfully', pass);
  } catch (error) {
    next(error);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const pass = await qrPassService.checkOut(req.body.qr_code_data, req.user.id, req.body.location);
    return successResponse(res, 200, 'Check-out recorded successfully', pass);
  } catch (error) {
    next(error);
  }
};

exports.deleteQRPass = async (req, res, next) => {
  try {
    await qrPassService.deleteQRPass(req.params.id);
    return successResponse(res, 200, 'QR Pass deleted successfully');
  } catch (error) {
    next(error);
  }
};
