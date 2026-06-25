const Exhibition = require('../models/Exhibition');
class ExhibitionRepository {
  async findAll(query = {}) { return await Exhibition.find(query); }
  async findById(id) { return await Exhibition.findById(id); }
  async create(data) { return await Exhibition.create(data); }
  async update(id, data) { return await Exhibition.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Exhibition.findByIdAndDelete(id); }
}
module.exports = new ExhibitionRepository();