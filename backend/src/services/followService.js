const followRepository = require('../repositories/followRepository');

class FollowService {
  async toggleFollow(followerId, exhibitorProfileId, exhibitionId) {
    // We expect exhibitionId from query/body to associate it properly
    const exhibitorRepo = require('../repositories/exhibitorRepository');
    const exhibitor = await exhibitorRepo.findById(exhibitorProfileId);
    if (!exhibitor) {
      const error = new Error('Exhibitor profile not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      await followRepository.create(followerId, exhibitorProfileId, exhibitor.exhibition);
      return { followed: true };
    } catch (err) {
      if (err.code === 11000) {
        // Already followed, so unfollow
        await followRepository.delete(followerId, exhibitorProfileId);
        return { followed: false };
      }
      throw err;
    }
  }

  async getFollowing(followerId, queryParams) {
    const { page = 1, limit = 20, exhibition } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return await followRepository.getFollowing(followerId, exhibition, skip, parseInt(limit));
  }

  async getFollowers(exhibitorProfileId, queryParams) {
    const { page = 1, limit = 20 } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return await followRepository.getFollowers(exhibitorProfileId, skip, parseInt(limit));
  }
}

module.exports = new FollowService();
