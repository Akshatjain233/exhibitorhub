const { errorResponse } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  try {
    // We can validate body, query, and params if defined in the schema
    const dataToValidate = {
      ...(schema.shape.body && { body: req.body }),
      ...(schema.shape.query && { query: req.query }),
      ...(schema.shape.params && { params: req.params }),
    };

    const parsed = schema.parse(Object.keys(dataToValidate).length > 0 ? dataToValidate : req.body);
    
    // Assign validated data back
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
    next();
  } catch (err) {
    const errors = err.errors ? err.errors.map(e => ({ field: e.path.join('.'), message: e.message })) : [];
    return errorResponse(res, 400, 'Validation Error', errors);
  }
};

module.exports = validate;
