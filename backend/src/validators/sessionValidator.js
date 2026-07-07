const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createSessionSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    hall: z.string().regex(objectIdRegex, 'Invalid Hall ID').optional(),
    title: z.string().min(2, 'Title is required'),
    type: z.string().optional(),
    time: z.string().optional(),
    duration: z.string().optional(),
    color: z.string().optional(),
    seats: z.number().int().nonnegative().optional(),
    live: z.boolean().optional()
  })
});

const updateSessionSchema = z.object({
  body: z.object({
    hall: z.string().regex(objectIdRegex).optional().nullable(),
    title: z.string().min(2).optional(),
    type: z.string().optional(),
    time: z.string().optional(),
    duration: z.string().optional(),
    color: z.string().optional(),
    seats: z.number().int().nonnegative().optional(),
    live: z.boolean().optional(),
    status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional()
  })
});

const registerSessionSchema = z.object({
  body: z.object({
    userId: z.string().regex(objectIdRegex, 'Invalid User ID')
  })
});

module.exports = {
  createSessionSchema,
  updateSessionSchema,
  registerSessionSchema
};
