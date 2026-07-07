const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const sendNotificationSchema = z.object({
  body: z.object({
    recipient: z.string().regex(objectIdRegex, 'Invalid Recipient ID'),
    exhibition: z.string().regex(objectIdRegex).optional(),
    title: z.string().min(2, 'Title is required'),
    message: z.string().min(2, 'Message is required'),
    type: z.enum(['info', 'alert', 'meeting', 'reminder']).optional(),
    link: z.string().optional()
  })
});

const broadcastNotificationSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID').optional(),
    targetRole: z.enum(['all', 'exhibitor', 'visitor', 'exhibition_admin']).optional(),
    title: z.string().min(2, 'Title is required'),
    message: z.string().min(2, 'Message is required'),
    type: z.enum(['info', 'alert', 'meeting', 'reminder']).optional(),
    link: z.string().optional()
  })
});

module.exports = {
  sendNotificationSchema,
  broadcastNotificationSchema
};
