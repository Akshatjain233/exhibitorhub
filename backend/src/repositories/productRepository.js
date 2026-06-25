const Product = require('../models/Product');
class ProductRepository {
  async findAll(query = {}) { return await Product.find(query); }
  async findById(id) { return await Product.findById(id); }
  async create(data) { return await Product.create(data); }
  async update(id, data) { return await Product.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Product.findByIdAndDelete(id); }
}
module.exports = new ProductRepository();