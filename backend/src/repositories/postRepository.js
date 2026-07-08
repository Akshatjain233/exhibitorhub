const Post = require('../models/Post');

class PostRepository {
  async create(data) {
    return await Post.create(data);
  }

  async findById(id) {
    return await Post.findById(id).populate('author', 'name email').populate('exhibitorProfile', 'companyName logo');
  }

  async findAll(query, skip = 0, limit = 20) {
    return await Post.find(query)
      .populate('author', 'name')
      .populate('exhibitorProfile', 'companyName logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async update(id, data) {
    return await Post.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Post.findByIdAndDelete(id);
  }

  async incrementLikes(id, amount = 1) {
    return await Post.findByIdAndUpdate(id, { $inc: { likesCount: amount } });
  }

  async incrementComments(id, amount = 1) {
    return await Post.findByIdAndUpdate(id, { $inc: { commentsCount: amount } });
  }
}

module.exports = new PostRepository();
