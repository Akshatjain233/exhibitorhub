const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createExhibitionSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    venue: z.string().regex(objectIdRegex, 'Invalid Venue ID'),
    organizerId: z.string().regex(objectIdRegex, 'Invalid Organizer ID').optional(),
    status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
    floormap_url: z.string().url().optional(),
    banner_url: z.string().url().optional(),
    logo_url: z.string().url().optional(),
    settings: z.object({
      allow_registration: z.boolean().optional(),
      is_public: z.boolean().optional()
    }).optional()
  })
});

const updateExhibitionSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    venue: z.string().regex(objectIdRegex).optional(),
    organizerId: z.string().regex(objectIdRegex).optional(),
    status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
    floormap_url: z.string().url().optional(),
    banner_url: z.string().url().optional(),
    logo_url: z.string().url().optional(),
    settings: z.object({
      allow_registration: z.boolean().optional(),
      is_public: z.boolean().optional()
    }).optional()
  })
});

module.exports = {
  createExhibitionSchema,
  updateExhibitionSchema
};
