const Like = require('../models/Like');

class LikeRepository {
  async create(postId, userId) {
    return await Like.create({ post: postId, user: userId });
  }

  async delete(postId, userId) {
    return await Like.findOneAndDelete({ post: postId, user: userId });
  }

  async exists(postId, userId) {
    const like = await Like.findOne({ post: postId, user: userId });
    return !!like;
  }
}

module.exports = new LikeRepository();
