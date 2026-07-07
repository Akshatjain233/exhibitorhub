const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createExhibitorSchema = z.object({
  body: z.object({
    userId: z.string().regex(objectIdRegex, 'Invalid User ID'),
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    booth: z.string().regex(objectIdRegex, 'Invalid Booth ID').optional(),
    name: z.string().min(2, 'Name is required'),
    industry: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional(),
    tagline: z.string().optional(),
    logo: z.string().url().optional(),
    gallery: z.array(z.string().url()).optional(),
    brochure_url: z.string().url().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'active', 'inactive']).optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional()
  })
});

const updateExhibitorSchema = z.object({
  body: z.object({
    booth: z.string().regex(objectIdRegex).optional().nullable(),
    name: z.string().min(2).optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional(),
    tagline: z.string().optional(),
    logo: z.string().url().optional(),
    gallery: z.array(z.string().url()).optional(),
    brochure_url: z.string().url().optional(),
    verified: z.boolean().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'active', 'inactive']).optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional()
  })
});

const assignBoothSchema = z.object({
  body: z.object({
    boothId: z.string().regex(objectIdRegex, 'Invalid Booth ID')
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'active', 'inactive'])
  })
});

module.exports = {
  createExhibitorSchema,
  updateExhibitorSchema,
  assignBoothSchema,
  updateStatusSchema
};
