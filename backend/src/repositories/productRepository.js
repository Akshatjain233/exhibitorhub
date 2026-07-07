const Product = require('../models/Product');

class ProductRepository {
  async create(data) {
    return await Product.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await Product.find(query)
      .populate('exhibitorId', 'name logo userId')
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Product.countDocuments(query);
  }

  async findById(id) {
    return await Product.findById(id)
      .populate('exhibitorId', 'name logo userId')
      .populate('exhibition', 'name').exec();
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('exhibitorId', 'name logo userId');
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductRepository();