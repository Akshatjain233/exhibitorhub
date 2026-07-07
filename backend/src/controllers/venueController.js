const venueService = require('../services/venueService');
const { successResponse } = require('../utils/response');

exports.createVenue = async (req, res, next) => {
  try {
    const venue = await venueService.createVenue(req.body);
    return successResponse(res, 201, 'Venue created successfully', venue);
  } catch (error) {
    next(error);
  }
};

exports.getVenues = async (req, res, next) => {
  try {
    const data = await venueService.getVenues(req.query);
    return successResponse(res, 200, 'Venues retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getVenueById = async (req, res, next) => {
  try {
    const venue = await venueService.getVenueById(req.params.id);
    return successResponse(res, 200, 'Venue retrieved successfully', venue);
  } catch (error) {
    next(error);
  }
};

exports.updateVenue = async (req, res, next) => {
  try {
    const venue = await venueService.updateVenue(req.params.id, req.body);
    return successResponse(res, 200, 'Venue updated successfully', venue);
  } catch (error) {
    next(error);
  }
};

exports.deleteVenue = async (req, res, next) => {
  try {
    await venueService.deleteVenue(req.params.id);
    return successResponse(res, 200, 'Venue deleted successfully');
  } catch (error) {
    next(error);
  }
};
