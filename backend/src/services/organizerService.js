const organizerRepository = require('../repositories/organizerRepository');
class OrganizerService {
  async getAll(query) { return await organizerRepository.findAll(query); }
  async getById(id) { return await organizerRepository.findById(id); }
  async create(data) { return await organizerRepository.create(data); }
  async update(id, data) { return await organizerRepository.update(id, data); }
  async delete(id) { return await organizerRepository.delete(id); }
}
module.exports = new OrganizerService();