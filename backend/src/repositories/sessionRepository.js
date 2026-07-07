const Session = require('../models/Session');

class SessionRepository {
  async create(data) {
    return await Session.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Session.find(query)
      .populate('exhibition', 'name')
      .populate('hall', 'name floor')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Session.countDocuments(query);
  }

  async findById(id) {
    return await Session.findById(id)
      .populate('exhibition', 'name')
      .populate('hall', 'name floor')
      .populate('registered_users', 'name email role').exec();
  }

  async update(id, updateData) {
    return await Session.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('exhibition', 'name')
      .populate('hall', 'name floor');
  }

  async delete(id) {
    return await Session.findByIdAndDelete(id);
  }
}

module.exports = new SessionRepository();