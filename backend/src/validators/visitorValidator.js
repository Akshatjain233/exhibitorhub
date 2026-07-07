const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createVisitorSchema = z.object({
  body: z.object({
    userId: z.string().regex(objectIdRegex, 'Invalid User ID'),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    company: z.string().optional(),
    designation: z.string().optional(),
    industry: z.string().optional(),
    interests: z.array(z.string()).optional(),
    avatar: z.string().url().optional()
  })
});

const updateVisitorSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    company: z.string().optional(),
    designation: z.string().optional(),
    industry: z.string().optional(),
    interests: z.array(z.string()).optional(),
    avatar: z.string().url().optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

module.exports = {
  createVisitorSchema,
  updateVisitorSchema
};
