const Gallery = require('../models/Gallery');
class GalleryRepository {
  async findAll(query = {}) { return await Gallery.find(query); }
  async findById(id) { return await Gallery.findById(id); }
  async create(data) { return await Gallery.create(data); }
  async update(id, data) { return await Gallery.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Gallery.findByIdAndDelete(id); }
}
module.exports = new GalleryRepository();