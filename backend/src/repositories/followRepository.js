const Follow = require('../models/Follow');

class FollowRepository {
  async create(followerId, exhibitorId, exhibitionId) {
    return await Follow.create({ follower: followerId, exhibitor: exhibitorId, exhibition: exhibitionId });
  }

  async delete(followerId, exhibitorId) {
    return await Follow.findOneAndDelete({ follower: followerId, exhibitor: exhibitorId });
  }

  async getFollowers(exhibitorId, skip = 0, limit = 20) {
    return await Follow.find({ exhibitor: exhibitorId })
      .populate('follower', 'name email company designation')
      .skip(skip)
      .limit(limit);
  }

  async getFollowing(followerId, exhibitionId, skip = 0, limit = 20) {
    let query = { follower: followerId };
    if (exhibitionId) query.exhibition = exhibitionId;
    
    return await Follow.find(query)
      .populate('exhibitor', 'companyName logo description')
      .skip(skip)
      .limit(limit);
  }
}

module.exports = new FollowRepository();
