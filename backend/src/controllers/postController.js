const postService = require('../services/postService');
const { successResponse } = require('../utils/response');

exports.createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.body, req.user);
    return successResponse(res, 201, 'Post created successfully', post);
  } catch (error) {
    next(error);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const { exhibition } = req.query;
    if (!exhibition) {
      return res.status(400).json({ success: false, message: 'Exhibition ID is required' });
    }
    const posts = await postService.getFeed(exhibition, req.query);
    return successResponse(res, 200, 'Feed retrieved', posts);
  } catch (error) {
    next(error);
  }
};

exports.getMyPosts = async (req, res, next) => {
  try {
    const posts = await postService.getMyPosts(req.user.id, req.query.exhibition, req.query);
    return successResponse(res, 200, 'My posts retrieved', posts);
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.params.id, req.body, req.user.id, req.user.role);
    return successResponse(res, 200, 'Post updated', post);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 200, 'Post deleted');
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);
    return successResponse(res, 200, 'Post retrieved', post);
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const result = await postService.toggleLike(req.params.id, req.user.id);
    return successResponse(res, 200, result.liked ? 'Post liked' : 'Post unliked', result);
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const comment = await postService.addComment(req.params.id, req.user.id, req.body);
    return successResponse(res, 201, 'Comment added', comment);
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await postService.getComments(req.params.id, req.query);
    return successResponse(res, 200, 'Comments retrieved', comments);
  } catch (error) {
    next(error);
  }
};

exports.hideComment = async (req, res, next) => {
  try {
    const comment = await postService.hideComment(req.params.commentId, req.user.role);
    return successResponse(res, 200, 'Comment hidden', comment);
  } catch (error) {
    next(error);
  }
};
