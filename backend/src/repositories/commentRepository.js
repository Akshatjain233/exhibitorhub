const Comment = require('../models/Comment');

class CommentRepository {
  async create(data) {
    return await Comment.create(data);
  }

  async findAllByPost(postId, skip = 0, limit = 20) {
    return await Comment.find({ post: postId, status: 'active' })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
  }

  async updateStatus(id, status) {
    return await Comment.findByIdAndUpdate(id, { status }, { new: true });
  }

  async delete(id) {
    return await Comment.findByIdAndDelete(id);
  }

  async findById(id) {
    return await Comment.findById(id);
  }
}

module.exports = new CommentRepository();
