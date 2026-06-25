const Session = require('../models/Session');
class SessionRepository {
  async findAll(query = {}) { return await Session.find(query); }
  async findById(id) { return await Session.findById(id); }
  async create(data) { return await Session.create(data); }
  async update(id, data) { return await Session.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Session.findByIdAndDelete(id); }
}
module.exports = new SessionRepository();