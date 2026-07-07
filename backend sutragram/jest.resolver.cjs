// Custom resolver for Jest to handle ESM-style .js imports
// Must be CommonJS (.cjs) since jest-resolve uses require() to load it
const path = require('path');

module.exports = function resolver(modulePath, options) {
    // For relative imports with explicit .js extension, try resolving directly
    if (modulePath.startsWith('.') && modulePath.endsWith('.js')) {
        const abs = path.resolve(options.basedir || '', modulePath);
        try {
            return require.resolve(abs);
        } catch (_) { }
    }

    try {
        return options.defaultResolver(modulePath, options);
    } catch (e) {
        // If path ends with .js and fails, try without extension as fallback
        if (modulePath.endsWith('.js')) {
            try {
                return options.defaultResolver(modulePath.slice(0, -3), options);
            } catch (_) { }
        }
        throw e;
    }
};
