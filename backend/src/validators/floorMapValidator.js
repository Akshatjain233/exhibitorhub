const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createFloorMapSchema = z.object({
  body: z.object({
    hall: z.string().regex(objectIdRegex, 'Invalid Hall ID'),
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    image_url: z.string().url('Must be a valid URL'),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    scale: z.number().positive().optional()
  })
});

const updateFloorMapSchema = z.object({
  body: z.object({
    image_url: z.string().url().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    scale: z.number().positive().optional()
  })
});

const assignBoothCoordinatesSchema = z.object({
  body: z.object({
    boothId: z.string().regex(objectIdRegex, 'Invalid Booth ID'),
    coordinates: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number().positive(),
      height: z.number().positive()
    })
  })
});

module.exports = {
  createFloorMapSchema,
  updateFloorMapSchema,
  assignBoothCoordinatesSchema
};
