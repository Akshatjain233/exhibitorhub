const Meeting = require('../models/Meeting');

class MeetingRepository {
  async create(data) {
    return await Meeting.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { scheduledAt: 1 }) {
    return await Meeting.find(query)
      .populate('requester', 'name email role')
      .populate('recipient', 'name email role')
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Meeting.countDocuments(query);
  }

  async findById(id) {
    return await Meeting.findById(id)
      .populate('requester', 'name email role')
      .populate('recipient', 'name email role')
      .populate('exhibition', 'name').exec();
  }

  async update(id, updateData) {
    return await Meeting.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Meeting.findByIdAndDelete(id);
  }
}

module.exports = new MeetingRepository();
