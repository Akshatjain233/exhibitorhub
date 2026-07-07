const { z } = require('zod');

const createVenueSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    country: z.string().min(2, 'Country is required'),
    capacity: z.number().int().positive().optional(),
    map_url: z.string().url('Must be a valid URL').optional(),
    images: z.array(z.string().url()).optional(),
    contact_info: z.object({
      phone: z.string().optional(),
      email: z.string().email('Invalid email').optional()
    }).optional()
  })
});

const updateVenueSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    capacity: z.number().int().positive().optional(),
    map_url: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    contact_info: z.object({
      phone: z.string().optional(),
      email: z.string().email().optional()
    }).optional()
  })
});

module.exports = {
  createVenueSchema,
  updateVenueSchema
};
