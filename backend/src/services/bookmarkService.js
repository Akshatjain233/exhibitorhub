const bookmarkRepository = require('../repositories/bookmarkRepository');

class BookmarkService {
  async addBookmark(data, currentUserId) {
    data.user = currentUserId;

    try {
      return await bookmarkRepository.create(data);
    } catch (err) {
      if (err.code === 11000) {
        const error = new Error('Already bookmarked');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async getBookmarks(queryData, currentUserId) {
    const { page = 1, limit = 10, exhibition, itemType, sort } = queryData;
    
    let query = { user: currentUserId };
    if (exhibition) query.exhibition = exhibition;
    if (itemType) query.itemType = itemType;

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'asc' ? 1 : -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookmarks = await bookmarkRepository.findAll(query, skip, parseInt(limit), sortObj);
    const total = await bookmarkRepository.count(query);

    return {
      bookmarks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async updateBookmark(id, data, currentUserId) {
    const bookmark = await bookmarkRepository.findById(id);
    if (!bookmark) {
      const error = new Error('Bookmark not found');
      error.statusCode = 404;
      throw error;
    }

    if (bookmark.user.toString() !== currentUserId) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    return await bookmarkRepository.update(id, data);
  }

  async removeBookmark(id, currentUserId) {
    const bookmark = await bookmarkRepository.findById(id);
    if (!bookmark) {
      const error = new Error('Bookmark not found');
      error.statusCode = 404;
      throw error;
    }

    if (bookmark.user.toString() !== currentUserId) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    return await bookmarkRepository.delete(id);
  }
}

module.exports = new BookmarkService();
