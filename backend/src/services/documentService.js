const documentRepository = require('../repositories/documentRepository');
class DocumentService {
  async getAll(query) { return await documentRepository.findAll(query); }
  async getById(id) { return await documentRepository.findById(id); }
  async create(data) { return await documentRepository.create(data); }
  async update(id, data) { return await documentRepository.update(id, data); }
  async delete(id) { return await documentRepository.delete(id); }
}
module.exports = new DocumentService();