const Sponsor = require('../models/Sponsor');
class SponsorRepository {
  async findAll(query = {}) { return await Sponsor.find(query); }
  async findById(id) { return await Sponsor.findById(id); }
  async create(data) { return await Sponsor.create(data); }
  async update(id, data) { return await Sponsor.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Sponsor.findByIdAndDelete(id); }
}
module.exports = new SponsorRepository();