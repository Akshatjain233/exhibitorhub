const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const generateQRPassSchema = z.object({
  body: z.object({
    user: z.string().regex(objectIdRegex, 'Invalid User ID'),
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID'),
    pass_type: z.enum(['visitor', 'exhibitor', 'vip', 'speaker', 'press', 'staff']).optional()
  })
});

const validateQRSchema = z.object({
  body: z.object({
    qr_code_data: z.string().min(5, 'QR Code Data is required'),
    location: z.string().optional()
  })
});

const scanQRSchema = z.object({
  body: z.object({
    qr_code_data: z.string().min(5, 'QR Code Data is required'),
    location: z.string().optional()
  })
});

const updateQRStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'revoked', 'expired'])
  })
});

module.exports = {
  generateQRPassSchema,
  validateQRSchema,
  scanQRSchema,
  updateQRStatusSchema
};
