const Bookmark = require('../models/Bookmark');

class BookmarkRepository {
  async create(data) {
    return await Bookmark.create(data);
  }

  async findAll(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    // Basic fetch without dynamic population. Service layer can populate based on itemType if needed
    return await Bookmark.find(query)
      .populate('exhibition', 'name')
      .sort(sort).skip(skip).limit(limit).exec();
  }

  async count(query = {}) {
    return await Bookmark.countDocuments(query);
  }

  async findById(id) {
    return await Bookmark.findById(id).exec();
  }

  async findOne(query) {
    return await Bookmark.findOne(query);
  }

  async update(id, updateData) {
    return await Bookmark.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Bookmark.findByIdAndDelete(id);
  }
}

module.exports = new BookmarkRepository();
