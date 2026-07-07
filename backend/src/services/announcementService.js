const announcementRepository = require('../repositories/announcementRepository');
const exhibitionRepository = require('../repositories/exhibitionRepository');

class AnnouncementService {
  async createAnnouncement(data) {
    const exhibition = await exhibitionRepository.findById(data.exhibition);
    if (!exhibition) {
      const error = new Error('Exhibition not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const announcement = await announcementRepository.create(data);
    
    if (announcement.status === 'published') {
      await this.sendPushNotificationStub(announcement);
    }
    
    return announcement;
  }

  async getAnnouncements(queryData) {
    const { page = 1, limit = 10, exhibition, targetAudience, status, search, sort } = queryData;
    
    let query = {};
    if (exhibition) query.exhibition = exhibition;
    if (status) query.status = status;
    
    if (targetAudience) {
      // If user is exhibitor/visitor, show 'all' + their specific role
      query.targetAudience = { $in: ['all', targetAudience] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'asc' ? 1 : -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const announcements = await announcementRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await announcementRepository.count(query);

    return {
      announcements,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async getAnnouncementById(id) {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) {
      const error = new Error('Announcement not found');
      error.statusCode = 404;
      throw error;
    }
    return announcement;
  }

  async updateAnnouncement(id, data) {
    const existing = await announcementRepository.findById(id);
    if (!existing) {
      const error = new Error('Announcement not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.status === 'published' && existing.status !== 'published') {
      data.publishedAt = new Date();
    }

    const announcement = await announcementRepository.update(id, data);
    
    if (data.status === 'published' && existing.status !== 'published') {
      await this.sendPushNotificationStub(announcement);
    }

    return announcement;
  }

  async deleteAnnouncement(id) {
    const announcement = await announcementRepository.delete(id);
    if (!announcement) {
      const error = new Error('Announcement not found');
      error.statusCode = 404;
      throw error;
    }
    return announcement;
  }

  async sendPushNotificationStub(announcement) {
    // Integration stub for Push Notifications
    console.log(`[PUSH NOTIFICATION] Sending announcement "${announcement.title}" to target: ${announcement.targetAudience}`);
  }
}

module.exports = new AnnouncementService();