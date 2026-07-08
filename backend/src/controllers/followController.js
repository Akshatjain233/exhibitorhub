const followService = require('../services/followService');
const exhibitorRepository = require('../repositories/exhibitorRepository');
const { successResponse } = require('../utils/response');

exports.toggleFollow = async (req, res, next) => {
  try {
    const exhibitorId = req.params.exhibitorId;
    const result = await followService.toggleFollow(req.user.id, exhibitorId);
    return successResponse(res, 200, result.followed ? 'Followed' : 'Unfollowed', result);
  } catch (error) {
    next(error);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const following = await followService.getFollowing(req.user.id, req.query);
    return successResponse(res, 200, 'Following list retrieved', following);
  } catch (error) {
    next(error);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    // Requires exhibitor ID, check if current user is an exhibitor
    let exhibitorProfileId = req.query.exhibitorId;
    
    if (req.user.role === 'exhibitor' && !exhibitorProfileId) {
       const exhibitor = await exhibitorRepository.findOne({ userId: req.user.id });
       if (exhibitor) {
         exhibitorProfileId = exhibitor._id;
       }
    }

    if (!exhibitorProfileId) {
      return res.status(400).json({ success: false, message: 'Exhibitor ID is required' });
    }

    const followers = await followService.getFollowers(exhibitorProfileId, req.query);
    return successResponse(res, 200, 'Followers list retrieved', followers);
  } catch (error) {
    next(error);
  }
};
