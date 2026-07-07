const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const addBookmarkSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    itemType: z.enum(['exhibitor', 'product', 'session']),
    itemId: z.string().regex(objectIdRegex, 'Invalid Item ID'),
    notes: z.string().optional()
  })
});

const updateBookmarkSchema = z.object({
  body: z.object({
    notes: z.string().optional()
  })
});

module.exports = {
  addBookmarkSchema,
  updateBookmarkSchema
};
