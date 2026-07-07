const Exhibitor = require('../models/Exhibitor');

class ExhibitorRepository {
  async create(data) {
    return await Exhibitor.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Exhibitor.find(query)
      .populate('userId', 'name email')
      .populate('exhibition', 'name')
      .populate('booth', 'booth_number hall')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Exhibitor.countDocuments(query);
  }

  async findById(id) {
    return await Exhibitor.findById(id)
      .populate('userId', 'name email')
      .populate('exhibition', 'name')
      .populate('booth', 'booth_number hall').exec();
  }

  async findOne(query) {
    return await Exhibitor.findOne(query)
      .populate('userId', 'name email')
      .populate('exhibition', 'name')
      .populate('booth', 'booth_number hall').exec();
  }

  async update(id, updateData) {
    return await Exhibitor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('userId', 'name email')
      .populate('exhibition', 'name')
      .populate('booth', 'booth_number hall');
  }

  async delete(id) {
    return await Exhibitor.findByIdAndDelete(id);
  }
}

module.exports = new ExhibitorRepository();