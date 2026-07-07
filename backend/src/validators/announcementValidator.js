const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createAnnouncementSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    title: z.string().min(2, 'Title is required'),
    content: z.string().min(5, 'Content is required'),
    targetAudience: z.enum(['all', 'exhibitor', 'visitor']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  })
});

const updateAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    content: z.string().min(5).optional(),
    targetAudience: z.enum(['all', 'exhibitor', 'visitor']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  })
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema
};
