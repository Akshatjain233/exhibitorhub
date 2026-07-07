const Visitor = require('../models/Visitor');

class VisitorRepository {
  async create(data) {
    return await Visitor.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Visitor.find(query)
      .populate('userId', 'email role')
      .populate('qrPass')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Visitor.countDocuments(query);
  }

  async findById(id) {
    return await Visitor.findById(id).populate('userId', 'email role').populate('qrPass').exec();
  }

  async findOne(query) {
    return await Visitor.findOne(query).populate('userId', 'email role').exec();
  }

  async update(id, updateData) {
    return await Visitor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Visitor.findByIdAndDelete(id);
  }
}

module.exports = new VisitorRepository();
