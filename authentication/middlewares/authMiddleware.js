// Re-export middleware with standardized names for route files
export { authenticate as protect, authorize as restrictTo, optionalAuth } from './userAuth.js';
