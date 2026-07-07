const Announcement = require('../models/Announcement');

class AnnouncementRepository {
  async create(data) {
    return await Announcement.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Announcement.find(query)
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Announcement.countDocuments(query);
  }

  async findById(id) {
    return await Announcement.findById(id).populate('exhibition', 'name').exec();
  }

  async update(id, updateData) {
    return await Announcement.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Announcement.findByIdAndDelete(id);
  }
}

module.exports = new AnnouncementRepository();