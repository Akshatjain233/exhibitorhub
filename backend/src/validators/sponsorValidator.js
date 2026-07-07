const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createSponsorSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    name: z.string().min(2, 'Name is required'),
    category: z.enum(['platinum', 'gold', 'silver', 'bronze', 'partner', 'media']).optional(),
    logoUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    description: z.string().optional(),
    priority: z.number().int().optional(),
    isVisible: z.boolean().optional()
  })
});

const updateSponsorSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    category: z.enum(['platinum', 'gold', 'silver', 'bronze', 'partner', 'media']).optional(),
    logoUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    description: z.string().optional(),
    priority: z.number().int().optional(),
    isVisible: z.boolean().optional()
  })
});

module.exports = {
  createSponsorSchema,
  updateSponsorSchema
};
