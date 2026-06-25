const sponsorRepository = require('../repositories/sponsorRepository');
class SponsorService {
  async getAll(query) { return await sponsorRepository.findAll(query); }
  async getById(id) { return await sponsorRepository.findById(id); }
  async create(data) { return await sponsorRepository.create(data); }
  async update(id, data) { return await sponsorRepository.update(id, data); }
  async delete(id) { return await sponsorRepository.delete(id); }
}
module.exports = new SponsorService();