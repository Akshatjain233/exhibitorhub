const FloorMap = require('../models/FloorMap');

class FloorMapRepository {
  async create(data) {
    return await FloorMap.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await FloorMap.find(query)
      .populate('hall', 'name')
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await FloorMap.countDocuments(query);
  }

  async findById(id) {
    return await FloorMap.findById(id).populate('hall', 'name').populate('exhibition', 'name').exec();
  }

  async findOne(query) {
    return await FloorMap.findOne(query).populate('hall', 'name').exec();
  }

  async update(id, updateData) {
    // increment version on update
    updateData.$inc = { version: 1 };
    return await FloorMap.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await FloorMap.findByIdAndDelete(id);
  }
}

module.exports = new FloorMapRepository();
