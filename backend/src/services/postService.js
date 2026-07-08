const postRepository = require('../repositories/postRepository');
const commentRepository = require('../repositories/commentRepository');
const likeRepository = require('../repositories/likeRepository');
const notificationService = require('./notificationService');
const followRepository = require('../repositories/followRepository');

class PostService {
  async createPost(data, user) {
    // Only Exhibitor and Exhibition Admin can create post
    if (user.role !== 'exhibitor' && user.role !== 'exhibition_admin' && user.role !== 'super_admin') {
      const error = new Error('You do not have permission to create posts');
      error.statusCode = 403;
      throw error;
    }

    const postData = {
      ...data,
      author: user.id,
      authorRole: user.role
    };

    if (user.role === 'exhibitor') {
      const exhibitorRepository = require('../repositories/exhibitorRepository');
      const exhibitor = await exhibitorRepository.findOne({ userId: user.id, exhibition: data.exhibition });
      if (!exhibitor) {
         const error = new Error('Exhibitor profile not found');
         error.statusCode = 403;
         throw error;
      }
      postData.exhibitorProfile = exhibitor._id;
    }

    const post = await postRepository.create(postData);

    // Notifications logic
    if (user.role === 'exhibition_admin' && data.type === 'Announcement') {
       // Broadcast to all registered visitors
       await notificationService.broadcastNotification({
         exhibition: data.exhibition,
         targetRole: 'visitor',
         title: 'New Event Announcement',
         message: data.content.substring(0, 50) + '...',
         type: 'announcement'
       });
    } else if (user.role === 'exhibitor') {
       // Notify followers
       const followers = await followRepository.getFollowers(postData.exhibitorProfile, 0, 1000);
       const notifications = followers.map(f => ({
         recipient: f.follower._id,
         exhibition: data.exhibition,
         title: 'New update from an Exhibitor you follow',
         message: data.content.substring(0, 50) + '...',
         type: 'post'
       }));
       if (notifications.length > 0) {
         const notificationRepo = require('../repositories/notificationRepository');
         await notificationRepo.insertMany(notifications);
       }
    }

    return post;
  }

  async getFeed(exhibitionId, queryParams) {
    const { page = 1, limit = 20, type } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { exhibition: exhibitionId, status: 'active' };
    if (type) query.type = type;

    return await postRepository.findAll(query, skip, parseInt(limit));
  }

  async getMyPosts(userId, exhibitionId, queryParams) {
    const { page = 1, limit = 20 } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { author: userId };
    if (exhibitionId) query.exhibition = exhibitionId;

    return await postRepository.findAll(query, skip, parseInt(limit));
  }

  async updatePost(postId, data, userId, userRole) {
    const post = await postRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Only author or Super Admin can edit
    if (post.author._id.toString() !== userId && userRole !== 'super_admin') {
      const error = new Error('Not authorized to edit this post');
      error.statusCode = 403;
      throw error;
    }

    return await postRepository.update(postId, data);
  }

  async deletePost(postId, userId, userRole) {
    const post = await postRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Author, Exhibition Admin, or Super Admin can delete
    if (post.author._id.toString() !== userId && userRole !== 'super_admin' && userRole !== 'exhibition_admin') {
      const error = new Error('Not authorized to delete this post');
      error.statusCode = 403;
      throw error;
    }

    await postRepository.delete(postId);
    return { success: true };
  }

  async getPostById(postId) {
    const post = await postRepository.findById(postId);
    if (!post || post.status !== 'active') {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    return post;
  }

  // --- Likes ---
  async toggleLike(postId, userId) {
    const exists = await likeRepository.exists(postId, userId);
    if (exists) {
      await likeRepository.delete(postId, userId);
      await postRepository.incrementLikes(postId, -1);
      return { liked: false };
    } else {
      await likeRepository.create(postId, userId);
      await postRepository.incrementLikes(postId, 1);
      return { liked: true };
    }
  }

  // --- Comments ---
  async addComment(postId, userId, data) {
    const comment = await commentRepository.create({
      post: postId,
      author: userId,
      content: data.content
    });
    await postRepository.incrementComments(postId, 1);
    return comment;
  }

  async getComments(postId, queryParams) {
    const { page = 1, limit = 20 } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return await commentRepository.findAllByPost(postId, skip, parseInt(limit));
  }

  async hideComment(commentId, userRole) {
    if (userRole !== 'super_admin' && userRole !== 'exhibition_admin') {
      const error = new Error('Not authorized to moderate comments');
      error.statusCode = 403;
      throw error;
    }
    return await commentRepository.updateStatus(commentId, 'hidden');
  }
}

module.exports = new PostService();
