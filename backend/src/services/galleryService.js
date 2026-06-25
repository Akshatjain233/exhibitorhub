const galleryRepository = require('../repositories/galleryRepository');
class GalleryService {
  async getAll(query) { return await galleryRepository.findAll(query); }
  async getById(id) { return await galleryRepository.findById(id); }
  async create(data) { return await galleryRepository.create(data); }
  async update(id, data) { return await galleryRepository.update(id, data); }
  async delete(id) { return await galleryRepository.delete(id); }
}
module.exports = new GalleryService();