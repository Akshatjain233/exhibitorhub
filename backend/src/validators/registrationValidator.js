const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createRegistrationSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    user: z.string().regex(objectIdRegex, 'Invalid User ID'),
    role: z.enum(['visitor', 'exhibitor_staff'])
  })
});

const updateRegistrationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'cancelled'])
  })
});

module.exports = {
  createRegistrationSchema,
  updateRegistrationStatusSchema
};
