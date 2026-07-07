const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const trackViewSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    targetType: z.enum(['exhibitor', 'product', 'session', 'general']),
    targetId: z.string().regex(objectIdRegex).optional()
  })
});

module.exports = {
  trackViewSchema
};
