const sessionRepository = require('../repositories/sessionRepository');
class SessionService {
  async getAll(query) { return await sessionRepository.findAll(query); }
  async getById(id) { return await sessionRepository.findById(id); }
  async create(data) { return await sessionRepository.create(data); }
  async update(id, data) { return await sessionRepository.update(id, data); }
  async delete(id) { return await sessionRepository.delete(id); }
}
module.exports = new SessionService();