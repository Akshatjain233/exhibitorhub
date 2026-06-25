const Document = require('../models/Document');
class DocumentRepository {
  async findAll(query = {}) { return await Document.find(query); }
  async findById(id) { return await Document.findById(id); }
  async create(data) { return await Document.create(data); }
  async update(id, data) { return await Document.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Document.findByIdAndDelete(id); }
}
module.exports = new DocumentRepository();