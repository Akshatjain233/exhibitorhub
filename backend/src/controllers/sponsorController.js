const sponsorService = require('../services/sponsorService');
const { successResponse } = require('../utils/response');

exports.createSponsor = async (req, res, next) => {
  try {
    const sponsor = await sponsorService.createSponsor(req.body);
    return successResponse(res, 201, 'Sponsor created successfully', sponsor);
  } catch (error) {
    next(error);
  }
};

exports.getSponsors = async (req, res, next) => {
  try {
    const data = await sponsorService.getSponsors(req.query);
    return successResponse(res, 200, 'Sponsors retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getSponsorById = async (req, res, next) => {
  try {
    const sponsor = await sponsorService.getSponsorById(req.params.id);
    return successResponse(res, 200, 'Sponsor retrieved successfully', sponsor);
  } catch (error) {
    next(error);
  }
};

exports.updateSponsor = async (req, res, next) => {
  try {
    const sponsor = await sponsorService.updateSponsor(req.params.id, req.body);
    return successResponse(res, 200, 'Sponsor updated successfully', sponsor);
  } catch (error) {
    next(error);
  }
};

exports.deleteSponsor = async (req, res, next) => {
  try {
    await sponsorService.deleteSponsor(req.params.id);
    return successResponse(res, 200, 'Sponsor deleted successfully');
  } catch (error) {
    next(error);
  }
};