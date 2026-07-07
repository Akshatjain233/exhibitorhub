const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const requestMeetingSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    recipient: z.string().regex(objectIdRegex, 'Invalid Recipient User ID'),
    scheduledAt: z.string().datetime(),
    durationMinutes: z.number().int().min(5).optional(),
    location: z.string().optional(),
    agenda: z.string().optional()
  })
});

const updateMeetingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'declined', 'cancelled']),
    notes: z.string().optional()
  })
});

const updateMeetingSchema = z.object({
  body: z.object({
    scheduledAt: z.string().datetime().optional(),
    durationMinutes: z.number().int().min(5).optional(),
    location: z.string().optional(),
    agenda: z.string().optional(),
    notes: z.string().optional()
  })
});

module.exports = {
  requestMeetingSchema,
  updateMeetingStatusSchema,
  updateMeetingSchema
};
