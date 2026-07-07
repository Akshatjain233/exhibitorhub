import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

let mongoServer;

// Setup: Runs before all tests
beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB');
});

// Cleanup: Runs after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('✅ Disconnected from in-memory MongoDB');
});

// Clear all collections between tests
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

// Global test timeout
jest.setTimeout(30000);
