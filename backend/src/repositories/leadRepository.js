const Lead = require('../models/Lead');

class LeadRepository {
  async create(data) {
    return await Lead.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Lead.find(query)
      .populate('scannedUser', 'name email role')
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Lead.countDocuments(query);
  }

  async findById(id) {
    return await Lead.findById(id)
      .populate('scannedUser', 'name email role')
      .populate('exhibition', 'name').exec();
  }

  async findOne(query) {
    return await Lead.findOne(query);
  }

  async update(id, updateData) {
    return await Lead.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Lead.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return await Lead.aggregate(pipeline);
  }
}

module.exports = new LeadRepository();
