const Sponsor = require('../models/Sponsor');

class SponsorRepository {
  async create(data) {
    return await Sponsor.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { priority: -1, createdAt: -1 }) {
    return await Sponsor.find(query)
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Sponsor.countDocuments(query);
  }

  async findById(id) {
    return await Sponsor.findById(id).populate('exhibition', 'name').exec();
  }

  async update(id, updateData) {
    return await Sponsor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Sponsor.findByIdAndDelete(id);
  }
}

module.exports = new SponsorRepository();