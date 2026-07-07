const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const scanLeadSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    qrData: z.string().min(5, 'QR Data is required')
  })
});

const updateLeadSchema = z.object({
  body: z.object({
    qualification: z.enum(['hot', 'warm', 'cold', 'unqualified']).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    followUp: z.boolean().optional()
  })
});

module.exports = {
  scanLeadSchema,
  updateLeadSchema
};
