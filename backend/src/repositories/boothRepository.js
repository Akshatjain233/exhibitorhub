const Booth = require('../models/Booth');

class BoothRepository {
  async create(boothData) {
    return await Booth.create(boothData);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Booth.find(query)
      .populate('hall', 'name floor')
      .populate('exhibition', 'name')
      .populate('assigned_to', 'name logo')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Booth.countDocuments(query);
  }

  async findById(id) {
    return await Booth.findById(id)
      .populate('hall', 'name floor')
      .populate('exhibition', 'name')
      .populate('assigned_to', 'name logo').exec();
  }

  async update(id, updateData) {
    return await Booth.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('hall', 'name floor')
      .populate('exhibition', 'name')
      .populate('assigned_to', 'name logo');
  }

  async delete(id) {
    return await Booth.findByIdAndDelete(id);
  }
}

module.exports = new BoothRepository();
