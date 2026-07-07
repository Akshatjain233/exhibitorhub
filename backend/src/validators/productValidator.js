const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createProductSchema = z.object({
  body: z.object({
    exhibitorId: z.string().regex(objectIdRegex, 'Invalid Exhibitor ID'),
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    gallery: z.array(z.string().url()).optional(),
    brochure_url: z.string().url().optional(),
    category: z.string().optional()
  })
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    gallery: z.array(z.string().url()).optional(),
    brochure_url: z.string().url().optional(),
    category: z.string().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

const updateProductApprovalSchema = z.object({
  body: z.object({
    approvalStatus: z.enum(['pending', 'approved', 'rejected'])
  })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  updateProductApprovalSchema
};
