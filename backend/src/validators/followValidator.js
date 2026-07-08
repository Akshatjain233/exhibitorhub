const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const followSchema = z.object({
  body: z.object({
    exhibition: z.string().regex(objectIdRegex, 'Invalid Exhibition ID')
  })
});

module.exports = {
  followSchema
};
