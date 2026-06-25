const exhibitorRepository = require('../repositories/exhibitorRepository');
class ExhibitorService {
  async getAll(query) { return await exhibitorRepository.findAll(query); }
  async getById(id) { return await exhibitorRepository.findById(id); }
  async create(data) { return await exhibitorRepository.create(data); }
  async update(id, data) { return await exhibitorRepository.update(id, data); }
  async delete(id) { return await exhibitorRepository.delete(id); }
}
module.exports = new ExhibitorService();