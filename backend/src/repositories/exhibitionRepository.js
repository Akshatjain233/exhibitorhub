const Exhibition = require('../models/Exhibition');

class ExhibitionRepository {
  async create(data) {
    return await Exhibition.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Exhibition.find(query)
      .populate('venue', 'name city country')
      .populate('organizerId', 'name email')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Exhibition.countDocuments(query);
  }

  async findById(id) {
    return await Exhibition.findById(id)
      .populate('venue', 'name city country')
      .populate('organizerId', 'name email').exec();
  }

  async update(id, updateData) {
    return await Exhibition.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('venue', 'name city country')
      .populate('organizerId', 'name email');
  }

  async delete(id) {
    return await Exhibition.findByIdAndDelete(id);
  }
}

module.exports = new ExhibitionRepository();