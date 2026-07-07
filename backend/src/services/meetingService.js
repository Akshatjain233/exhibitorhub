const meetingRepository = require('../repositories/meetingRepository');

class MeetingService {
  async requestMeeting(data, currentUserId) {
    if (data.recipient === currentUserId) {
      const error = new Error('You cannot request a meeting with yourself');
      error.statusCode = 400;
      throw error;
    }

    data.requester = currentUserId;
    data.status = 'pending';
    return await meetingRepository.create(data);
  }

  async getMeetings(queryData, currentUserId, currentUserRole) {
    const { page = 1, limit = 10, exhibition, status, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (status) query.status = status;

    // Normal users can only see meetings where they are requester or recipient
    if (!['super_admin', 'exhibition_admin'].includes(currentUserRole)) {
      query.$or = [
        { requester: currentUserId },
        { recipient: currentUserId }
      ];
    }

    let sortObj = { scheduledAt: 1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'asc' ? 1 : -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const meetings = await meetingRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await meetingRepository.count(query);

    return {
      meetings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getMeetingById(id, currentUserId, currentUserRole) {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) {
      const error = new Error('Meeting not found');
      error.statusCode = 404;
      throw error;
    }

    if (!['super_admin', 'exhibition_admin'].includes(currentUserRole) &&
        meeting.requester._id.toString() !== currentUserId &&
        meeting.recipient._id.toString() !== currentUserId) {
      const error = new Error('Unauthorized to view this meeting');
      error.statusCode = 403;
      throw error;
    }

    return meeting;
  }

  async updateMeetingStatus(id, data, currentUserId, currentUserRole) {
    const meeting = await this.getMeetingById(id, currentUserId, currentUserRole);

    if (data.status === 'accepted' || data.status === 'declined') {
      if (meeting.recipient._id.toString() !== currentUserId && !['super_admin', 'exhibition_admin'].includes(currentUserRole)) {
        const error = new Error('Only the recipient can accept or decline a meeting');
        error.statusCode = 403;
        throw error;
      }
    }

    if (data.status === 'cancelled') {
      if (meeting.requester._id.toString() !== currentUserId && meeting.recipient._id.toString() !== currentUserId && !['super_admin', 'exhibition_admin'].includes(currentUserRole)) {
        const error = new Error('Unauthorized to cancel this meeting');
        error.statusCode = 403;
        throw error;
      }
    }

    return await meetingRepository.update(id, data);
  }

  async updateMeetingDetails(id, data, currentUserId, currentUserRole) {
    const meeting = await this.getMeetingById(id, currentUserId, currentUserRole);

    if (meeting.requester._id.toString() !== currentUserId && meeting.recipient._id.toString() !== currentUserId && !['super_admin', 'exhibition_admin'].includes(currentUserRole)) {
      const error = new Error('Unauthorized to update this meeting');
      error.statusCode = 403;
      throw error;
    }

    return await meetingRepository.update(id, data);
  }

  async deleteMeeting(id, currentUserId, currentUserRole) {
    const meeting = await this.getMeetingById(id, currentUserId, currentUserRole);
    
    if (meeting.requester._id.toString() !== currentUserId && !['super_admin', 'exhibition_admin'].includes(currentUserRole)) {
      const error = new Error('Only the requester can delete the meeting record');
      error.statusCode = 403;
      throw error;
    }

    return await meetingRepository.delete(id);
  }
}

module.exports = new MeetingService();
