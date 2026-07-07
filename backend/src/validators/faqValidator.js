const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createFAQSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    question: z.string().min(5, 'Question is required'),
    answer: z.string().min(5, 'Answer is required'),
    category: z.string().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional()
  })
});

const updateFAQSchema = z.object({
  body: z.object({
    question: z.string().min(5).optional(),
    answer: z.string().min(5).optional(),
    category: z.string().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional()
  })
});

const reorderFAQSchema = z.object({
  body: z.object({
    faqs: z.array(z.object({
      id: z.string().regex(objectIdRegex),
      order: z.number().int()
    }))
  })
});

module.exports = {
  createFAQSchema,
  updateFAQSchema,
  reorderFAQSchema
};
