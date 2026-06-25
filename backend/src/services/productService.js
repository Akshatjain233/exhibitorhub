const productRepository = require('../repositories/productRepository');
class ProductService {
  async getAll(query) { return await productRepository.findAll(query); }
  async getById(id) { return await productRepository.findById(id); }
  async create(data) { return await productRepository.create(data); }
  async update(id, data) { return await productRepository.update(id, data); }
  async delete(id) { return await productRepository.delete(id); }
}
module.exports = new ProductService();