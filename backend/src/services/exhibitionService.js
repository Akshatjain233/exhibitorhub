const exhibitionRepository = require('../repositories/exhibitionRepository');
class ExhibitionService {
  async getAll(query) { return await exhibitionRepository.findAll(query); }
  async getById(id) { return await exhibitionRepository.findById(id); }
  async create(data) { return await exhibitionRepository.create(data); }
  async update(id, data) { return await exhibitionRepository.update(id, data); }
  async delete(id) { return await exhibitionRepository.delete(id); }
}
module.exports = new ExhibitionService();