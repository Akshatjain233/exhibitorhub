import express from 'express';
import mongoose from 'mongoose';

/**
 * Quick Route Registration Test
 * Verifies that all routes including disputes are properly registered
 */

// Setup
const app = express();
app.use(express.json());

console.log('📋 Route Registration Verification Test\n');
console.log('='.repeat(60));

// Import routes
try {
  console.log('\n✅ Importing routes module...');
  const routes = await import('./routes/index.js');
  console.log('✅ Routes module imported successfully');
  
  // Mount routes
  app.use('/api/v1', routes.default);
  console.log('✅ Routes mounted at /api/v1');
  
} catch (error) {
  console.error('❌ Failed to import routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// List all registered routes
console.log('\n📍 Registered Routes:');
console.log('-'.repeat(60));

function listRoutes(route, prefix = '') {
  if (route.route) {
    const methods = Object.keys(route.route.methods).map(m => m.toUpperCase());
    console.log(`   ${methods.join(',')}  ${prefix}${route.route.path}`);
  } else if (route.name === 'router' && route.regexp) {
    const match = route.regexp.source.match(/\\\/([^\\]+)/);
    if (match) {
      const routePath = '/' + match[1];
      console.log(`   [Nested] ${prefix}${routePath}`);
      if (route.handle.stack) {
        route.handle.stack.forEach(nestedRoute => {
          listRoutes(nestedRoute, prefix + routePath);
        });
      }
    }
  }
}

// Find all routes in the app
if (app._router && app._router.stack) {
  const routes = app._router.stack
    .filter(layer => layer.route || layer.name === 'router')
    .sort((a, b) => {
      const aPath = a.route ? a.route.path : a.regexp.source;
      const bPath = b.route ? b.route.path : b.regexp.source;
      return aPath.localeCompare(bPath);
    });

  routes.forEach(route => {
    if (route.regexp.source.startsWith('\\/api')) {
      listRoutes(route);
    }
  });
}

// Check for disputes route
console.log('\n🔍 Disputes Route Check:');
console.log('-'.repeat(60));

let disputesFound = false;
if (app._router && app._router.stack) {
  app._router.stack.forEach(layer => {
    if (layer.regexp && layer.regexp.source.includes('disputes')) {
      disputesFound = true;
      console.log('✅ Disputes route found in middleware stack');
    }
  });
}

if (!disputesFound) {
  console.log('⚠️  No explicit disputes route found in main stack');
  console.log('   (This may be nested inside /api/v1 router)');
}

// Test endpoint accessibility
console.log('\n🧪 Testing Route Accessibility:');
console.log('-'.repeat(60));

const testEndpoints = [
  { method: 'POST', path: '/api/v1/disputes', name: 'Create Dispute' },
  { method: 'GET', path: '/api/v1/disputes/my-disputes', name: 'Get My Disputes' },
  { method: 'GET', path: '/api/v1/disputes', name: 'Get All Disputes (Admin)' },
  { method: 'PUT', path: '/api/v1/disputes/123/resolve', name: 'Resolve Dispute' },
  { method: 'GET', path: '/api/v1/status', name: 'API Status' }
];

let routeErrors = [];

testEndpoints.forEach(endpoint => {
  try {
    // Try to find the route
    const match = app._find_route(endpoint.method, endpoint.path);
    if (match) {
      console.log(`✅ ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)} (${endpoint.name})`);
    } else if (endpoint.path.includes('disputes')) {
      console.log(`⚠️  ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)} (${endpoint.name}) - NOT FOUND`);
      routeErrors.push(endpoint);
    }
  } catch (error) {
    if (endpoint.path.includes('disputes')) {
      console.log(`❌ ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)} (${endpoint.name}) - ERROR`);
      routeErrors.push(endpoint);
    }
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary:');
console.log('-'.repeat(60));

if (routeErrors.length > 0) {
  console.log(`❌ ${routeErrors.length} routes NOT FOUND:`);
  routeErrors.forEach(r => console.log(`   - ${r.method} ${r.path}`));
} else {
  console.log('✅ All disputes routes found and accessible!');
}

console.log('\n✅ Route registration verification complete\n');

// Exit
process.exit(routeErrors.length > 0 ? 1 : 0);
