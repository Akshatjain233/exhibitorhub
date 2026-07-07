const meetingService = require('../services/meetingService');
const { successResponse } = require('../utils/response');

exports.requestMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.requestMeeting(req.body, req.user.id);
    return successResponse(res, 201, 'Meeting requested successfully', meeting);
  } catch (error) {
    next(error);
  }
};

exports.getMeetings = async (req, res, next) => {
  try {
    const data = await meetingService.getMeetings(req.query, req.user.id, req.user.role);
    return successResponse(res, 200, 'Meetings retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getMeetingById = async (req, res, next) => {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 200, 'Meeting retrieved successfully', meeting);
  } catch (error) {
    next(error);
  }
};

exports.updateMeetingStatus = async (req, res, next) => {
  try {
    const meeting = await meetingService.updateMeetingStatus(req.params.id, req.body, req.user.id, req.user.role);
    return successResponse(res, 200, 'Meeting status updated successfully', meeting);
  } catch (error) {
    next(error);
  }
};

exports.updateMeetingDetails = async (req, res, next) => {
  try {
    const meeting = await meetingService.updateMeetingDetails(req.params.id, req.body, req.user.id, req.user.role);
    return successResponse(res, 200, 'Meeting details updated successfully', meeting);
  } catch (error) {
    next(error);
  }
};

exports.deleteMeeting = async (req, res, next) => {
  try {
    await meetingService.deleteMeeting(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 200, 'Meeting deleted successfully');
  } catch (error) {
    next(error);
  }
};
