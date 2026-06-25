const Exhibitor = require('../models/Exhibitor');
class ExhibitorRepository {
  async findAll(query = {}) { return await Exhibitor.find(query); }
  async findById(id) { return await Exhibitor.findById(id); }
  async create(data) { return await Exhibitor.create(data); }
  async update(id, data) { return await Exhibitor.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Exhibitor.findByIdAndDelete(id); }
}
module.exports = new ExhibitorRepository();