const { z } = require('zod');

// Regex for valid MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createHallSchema = z.object({
  body: z.object({
    venue: z.string().regex(objectIdRegex, 'Invalid Venue ID'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    floor: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    dimensions: z.object({
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      unit: z.enum(['meters', 'feet']).optional()
    }).optional(),
    map_image_url: z.string().url('Must be a valid URL').optional()
  })
});

const updateHallSchema = z.object({
  body: z.object({
    venue: z.string().regex(objectIdRegex, 'Invalid Venue ID').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    floor: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    dimensions: z.object({
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      unit: z.enum(['meters', 'feet']).optional()
    }).optional(),
    map_image_url: z.string().url('Must be a valid URL').optional()
  })
});

module.exports = {
  createHallSchema,
  updateHallSchema
};
