const { z } = require('zod');
const ROLES = require('../constants/roles');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(ROLES).optional().default(ROLES.VISITOR)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
