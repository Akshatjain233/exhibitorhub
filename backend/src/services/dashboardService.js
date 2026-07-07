const userRepository = require('../repositories/userRepository');
const exhibitionRepository = require('../repositories/exhibitionRepository');
const exhibitorRepository = require('../repositories/exhibitorRepository');
const visitorRepository = require('../repositories/visitorRepository');
const leadRepository = require('../repositories/leadRepository');
const meetingRepository = require('../repositories/meetingRepository');
const registrationRepository = require('../repositories/registrationRepository');

class DashboardService {
  async getSuperAdminDashboard() {
    const totalUsers = await userRepository.count();
    const totalExhibitions = await exhibitionRepository.count();
    const activeExhibitions = await exhibitionRepository.count({ status: 'active' });
    const totalExhibitors = await exhibitorRepository.count();
    const totalVisitors = await visitorRepository.count();

    return {
      stats: {
        totalUsers,
        totalExhibitions,
        activeExhibitions,
        totalExhibitors,
        totalVisitors
      }
    };
  }

  async getExhibitionAdminDashboard(exhibitionId) {
    if (!exhibitionId) throw new Error('Exhibition ID is required for this dashboard');

    const totalRegistrations = await registrationRepository.count({ exhibition: exhibitionId });
    const approvedRegistrations = await registrationRepository.count({ exhibition: exhibitionId, status: 'approved' });
    const totalExhibitors = await exhibitorRepository.count({ exhibition: exhibitionId });
    const totalLeads = await leadRepository.count({ exhibition: exhibitionId });
    const totalMeetings = await meetingRepository.count({ exhibition: exhibitionId });

    return {
      stats: {
        totalRegistrations,
        approvedRegistrations,
        totalExhibitors,
        totalLeads,
        totalMeetings
      }
    };
  }

  async getExhibitorDashboard(exhibitionId, userId) {
    if (!exhibitionId) throw new Error('Exhibition ID is required');

    const exhibitor = await exhibitorRepository.findOne({ userId, exhibition: exhibitionId });
    let totalLeads = 0;
    let pendingMeetings = 0;
    let upcomingMeetings = 0;

    if (exhibitor) {
      totalLeads = await leadRepository.count({ exhibition: exhibitionId, exhibitorProfile: exhibitor._id });
    } else {
      totalLeads = await leadRepository.count({ exhibition: exhibitionId, scannedBy: userId });
    }

    pendingMeetings = await meetingRepository.count({ exhibition: exhibitionId, recipient: userId, status: 'pending' });
    upcomingMeetings = await meetingRepository.count({ exhibition: exhibitionId, $or: [{ requester: userId }, { recipient: userId }], status: 'accepted' });

    return {
      stats: {
        totalLeads,
        pendingMeetings,
        upcomingMeetings
      }
    };
  }

  async getVisitorDashboard(exhibitionId, userId) {
    if (!exhibitionId) throw new Error('Exhibition ID is required');

    const registration = await registrationRepository.findOne({ user: userId, exhibition: exhibitionId });
    const registrationStatus = registration ? registration.status : 'not_registered';

    const pendingMeetings = await meetingRepository.count({ exhibition: exhibitionId, recipient: userId, status: 'pending' });
    const upcomingMeetings = await meetingRepository.count({ exhibition: exhibitionId, $or: [{ requester: userId }, { recipient: userId }], status: 'accepted' });

    return {
      stats: {
        registrationStatus,
        pendingMeetings,
        upcomingMeetings
      }
    };
  }
}

module.exports = new DashboardService();
