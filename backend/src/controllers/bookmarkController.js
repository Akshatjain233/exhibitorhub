const bookmarkService = require('../services/bookmarkService');
const { successResponse } = require('../utils/response');

exports.addBookmark = async (req, res, next) => {
  try {
    const bookmark = await bookmarkService.addBookmark(req.body, req.user.id);
    return successResponse(res, 201, 'Bookmark added successfully', bookmark);
  } catch (error) {
    next(error);
  }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const data = await bookmarkService.getBookmarks(req.query, req.user.id);
    return successResponse(res, 200, 'Bookmarks retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.updateBookmark = async (req, res, next) => {
  try {
    const bookmark = await bookmarkService.updateBookmark(req.params.id, req.body, req.user.id);
    return successResponse(res, 200, 'Bookmark updated successfully', bookmark);
  } catch (error) {
    next(error);
  }
};

exports.removeBookmark = async (req, res, next) => {
  try {
    await bookmarkService.removeBookmark(req.params.id, req.user.id);
    return successResponse(res, 200, 'Bookmark removed successfully');
  } catch (error) {
    next(error);
  }
};
