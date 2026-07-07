const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createBoothSchema = z.object({
  body: z.object({
    hall: z.string().regex(objectIdRegex, 'Invalid Hall ID'),
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    booth_number: z.string().min(1, 'Booth number is required'),
    size: z.string().optional(),
    type: z.enum(['standard', 'premium', 'island', 'custom']).optional(),
    status: z.enum(['available', 'reserved', 'booked']).optional(),
    price: z.number().nonnegative().optional(),
    assigned_to: z.string().regex(objectIdRegex, 'Invalid Exhibitor ID').optional(),
    coordinates: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }).optional()
  })
});

const updateBoothSchema = z.object({
  body: z.object({
    hall: z.string().regex(objectIdRegex).optional(),
    exhibition: z.string().regex(objectIdRegex).optional(),
    booth_number: z.string().optional(),
    size: z.string().optional(),
    type: z.enum(['standard', 'premium', 'island', 'custom']).optional(),
    status: z.enum(['available', 'reserved', 'booked']).optional(),
    price: z.number().nonnegative().optional(),
    assigned_to: z.string().regex(objectIdRegex).optional().nullable(),
    coordinates: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }).optional()
  })
});

module.exports = {
  createBoothSchema,
  updateBoothSchema
};
