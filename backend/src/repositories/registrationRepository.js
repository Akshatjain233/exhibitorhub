const Registration = require('../models/Registration');

class RegistrationRepository {
  async create(data) {
    return await Registration.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Registration.find(query)
      .populate('exhibition', 'name startDate endDate')
      .populate('user', 'name email role')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Registration.countDocuments(query);
  }

  async findById(id) {
    return await Registration.findById(id)
      .populate('exhibition', 'name startDate endDate')
      .populate('user', 'name email role').exec();
  }

  async findOne(query) {
    return await Registration.findOne(query);
  }

  async update(id, updateData) {
    return await Registration.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Registration.findByIdAndDelete(id);
  }
}

module.exports = new RegistrationRepository();
