const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createPostSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
    images: z.array(z.string().url()).optional(),
    videos: z.array(z.string().url()).optional(),
    attachments: z.array(z.string().url()).optional(),
    type: z.enum(['Announcement', 'Product', 'Offer', 'Live Demo', 'Session Update', 'Sponsor', 'General']).optional(),
    visibility: z.enum(['public', 'registered_only']).optional()
  })
});

const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(2000).optional(),
    images: z.array(z.string().url()).optional(),
    videos: z.array(z.string().url()).optional(),
    attachments: z.array(z.string().url()).optional(),
    type: z.enum(['Announcement', 'Product', 'Offer', 'Live Demo', 'Session Update', 'Sponsor', 'General']).optional(),
    visibility: z.enum(['public', 'registered_only']).optional(),
    status: z.enum(['active', 'hidden', 'draft']).optional()
  })
});

const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long')
  })
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  createCommentSchema
};
