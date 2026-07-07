const Hall = require('../models/Hall');

class HallRepository {
  async create(hallData) {
    return await Hall.create(hallData);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Hall.find(query).populate('venue', 'name city').sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Hall.countDocuments(query);
  }

  async findById(id) {
    return await Hall.findById(id).populate('venue', 'name city').exec();
  }

  async update(id, updateData) {
    return await Hall.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('venue', 'name city');
  }

  async delete(id) {
    return await Hall.findByIdAndDelete(id);
  }
}

module.exports = new HallRepository();
