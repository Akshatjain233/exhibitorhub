const announcementRepository = require('../repositories/announcementRepository');
class AnnouncementService {
  async getAll(query) { return await announcementRepository.findAll(query); }
  async getById(id) { return await announcementRepository.findById(id); }
  async create(data) { return await announcementRepository.create(data); }
  async update(id, data) { return await announcementRepository.update(id, data); }
  async delete(id) { return await announcementRepository.delete(id); }
}
module.exports = new AnnouncementService();