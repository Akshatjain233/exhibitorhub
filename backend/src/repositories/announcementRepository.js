const Announcement = require('../models/Announcement');
class AnnouncementRepository {
  async findAll(query = {}) { return await Announcement.find(query); }
  async findById(id) { return await Announcement.findById(id); }
  async create(data) { return await Announcement.create(data); }
  async update(id, data) { return await Announcement.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Announcement.findByIdAndDelete(id); }
}
module.exports = new AnnouncementRepository();