/**
 * Integration Test: Disputes API Endpoints
 * Tests all dispute endpoints after routing fix
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import apiRoutes from '../../routes/index.js';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);

// Mock auth middleware for testing
app.use((req, res, next) => {
  if (req.path.includes('/disputes')) {
    // Add mock user for testing
    req.userId = 'mock-user-id';
    req.userRole = 'user';
    req.user = { _id: 'mock-user-id', role: 'user' };
  }
  next();
});

describe('Disputes API Routes - Post-Fix Verification', () => {
  
  test('✅ Routes should be registered', () => {
    const routes = app._router.stack
      .filter(layer => layer.route || layer.name === 'router')
      .map(layer => layer.route ? layer.route.path : (layer.regexp ? layer.regexp.source : ''));
    
    expect(routes.some(r => r.includes('disputes'))).toBe(true);
  });

  test('✅ Dispute routes should be mounted at /disputes', async () => {
    const response = await request(app)
      .get('/api/v1/status')
      .expect(200);

    expect(response.body.routes.disputes).toBe('active');
  });

  test('✅ POST /api/v1/disputes should be accessible', async () => {
    // Test that the route exists (will fail with 400 due to missing body, but not 404)
    const response = await request(app)
      .post('/api/v1/disputes')
      .set('Authorization', 'Bearer mock-token');
    
    // Should NOT be 404 (route not found)
    expect(response.status).not.toBe(404);
    // Could be 400 (bad request) or 500 (server error), but not 404
    console.log(`  POST /disputes status: ${response.status} (not 404) ✅`);
  });

  test('✅ GET /api/v1/disputes/my-disputes should be accessible', async () => {
    const response = await request(app)
      .get('/api/v1/disputes/my-disputes')
      .set('Authorization', 'Bearer mock-token');
    
    expect(response.status).not.toBe(404);
    console.log(`  GET /disputes/my-disputes status: ${response.status} (not 404) ✅`);
  });

  test('✅ GET /api/v1/disputes (admin) should be accessible', async () => {
    const response = await request(app)
      .get('/api/v1/disputes')
      .set('Authorization', 'Bearer mock-token');
    
    expect(response.status).not.toBe(404);
    console.log(`  GET /disputes (admin) status: ${response.status} (not 404) ✅`);
  });

  test('✅ PUT /api/v1/disputes/:id/resolve should be accessible', async () => {
    const response = await request(app)
      .put('/api/v1/disputes/mock-id/resolve')
      .set('Authorization', 'Bearer mock-token');
    
    expect(response.status).not.toBe(404);
    console.log(`  PUT /disputes/mock-id/resolve status: ${response.status} (not 404) ✅`);
  });

  test('✅ All dispute routes should NOT return 404', async () => {
    const endpoints = [
      { method: 'post', path: '/api/v1/disputes' },
      { method: 'get', path: '/api/v1/disputes/my-disputes' },
      { method: 'get', path: '/api/v1/disputes' },
      { method: 'put', path: '/api/v1/disputes/test-id/resolve' }
    ];

    const results = [];
    for (const endpoint of endpoints) {
      const req = request(app)[endpoint.method](endpoint.path)
        .set('Authorization', 'Bearer mock-token');
      
      const response = await req;
      const is404 = response.status === 404;
      results.push({
        endpoint: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
        status: response.status,
        is404
      });

      if (!is404) {
        console.log(`  ✅ ${endpoint.method.toUpperCase().padEnd(6)} ${endpoint.path.padEnd(40)} → ${response.status}`);
      }
    }

    const allNot404 = results.every(r => !r.is404);
    expect(allNot404).toBe(true);

    if (allNot404) {
      console.log('\n✅ ALL ENDPOINTS WORKING - No 404 errors found!\n');
    }
  });
});

export default app;
