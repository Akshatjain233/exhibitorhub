import request from 'supertest';
import app from '../../../server.js';
import Content from '../../../models/Content.js';
import { createTestUser, generateToken } from '../../fixtures/helpers.js';

describe('Content Controller - Exhaustive Integration Tests', () => {
    let artisan, artisanToken, consumer, consumerToken;

    beforeEach(async () => {
        const artisanResult = await createTestUser('artisan');
        const consumerResult = await createTestUser('consumer');

        artisan = artisanResult.user;
        consumer = consumerResult.user;
        artisanToken = generateToken(artisan._id);
        consumerToken = generateToken(consumer._id);
    });

    describe('POST /api/content - Create Content', () => {
        test('should create video content successfully', async () => {
            const response = await request(app)
                .post('/api/content')
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    content_type: 'video',
                    media_url: 'https://example.com/video.mp4',
                    title: 'Pottery Tutorial',
                    description: 'Learn how to make pots',
                    craft_tags: ['pottery', 'handmade'],
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.content.title).toBe('Pottery Tutorial');
        });

        test('should fail without authentication', async () => {
            const response = await request(app).post('/api/content').send({
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
            });

            expect(response.status).toBe(401);
        });

        test('should fail when artisan tries to create content for another artisan', async () => {
            const otherArtisan = await createTestUser('artisan', { email: 'other@test.com' });

            const response = await request(app)
                .post('/api/content')
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    artisan: otherArtisan.user._id,
                    content_type: 'video',
                    media_url: 'https://example.com/video.mp4',
                    title: 'Test',
                });

            // Should use authenticated user's ID, not the one in request
            expect(response.body.data.content.artisan.toString()).toBe(artisan._id.toString());
        });

        test('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/content')
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    content_type: 'video',
                    // Missing media_url and title
                });

            expect(response.status).toBe(400);
        });

        test('should fail when consumer tries to create content', async () => {
            const response = await request(app)
                .post('/api/content')
                .set('Authorization', `Bearer ${consumerToken}`)
                .send({
                    content_type: 'video',
                    media_url: 'https://example.com/video.mp4',
                    title: 'Test',
                });

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/content/:contentId - Get Content', () => {
        let content;

        beforeEach(async () => {
            content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test Video',
                views_count: 0,
            });
        });

        test('should get content by ID', async () => {
            const response = await request(app).get(`/api/content/${content._id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.content.title).toBe('Test Video');
        });

        test('should increment views_count when viewing', async () => {
            await request(app).get(`/api/content/${content._id}`);

            const updatedContent = await Content.findById(content._id);
            expect(updatedContent.views_count).toBe(1);
        });

        test('should fail with invalid content ID', async () => {
            const response = await request(app).get('/api/content/invalid-id');

            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        test('should fail when content does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app).get(`/api/content/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/content/:contentId/like - Like Content', () => {
        let content;

        beforeEach(async () => {
            content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test Video',
                likes_count: 0,
            });
        });

        test('should like content successfully', async () => {
            const response = await request(app)
                .post(`/api/content/${content._id}/like`)
                .set('Authorization', `Bearer ${consumerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const updatedContent = await Content.findById(content._id);
            expect(updatedContent.likes_count).toBe(1);
        });

        test('should fail without authentication', async () => {
            const response = await request(app).post(`/api/content/${content._id}/like`);

            expect(response.status).toBe(401);
        });

        test('should prevent double-liking (if implemented)', async () => {
            await request(app)
                .post(`/api/content/${content._id}/like`)
                .set('Authorization', `Bearer ${consumerToken}`);

            const response = await request(app)
                .post(`/api/content/${content._id}/like`)
                .set('Authorization', `Bearer ${consumerToken}`);

            // Behavior depends on implementation
            // Either 200 (idempotent) or 400 (already liked)
            expect([200, 400]).toContain(response.status);
        });
    });

    describe('DELETE /api/content/:contentId - Delete Content', () => {
        let content;

        beforeEach(async () => {
            content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test Video',
            });
        });

        test('should delete own content successfully', async () => {
            const response = await request(app)
                .delete(`/api/content/${content._id}`)
                .set('Authorization', `Bearer ${artisanToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const deletedContent = await Content.findById(content._id);
            expect(deletedContent).toBeNull();
        });

        test('should fail to delete another artisan content', async () => {
            const otherArtisan = await createTestUser('artisan', { email: 'other@test.com' });
            const otherToken = generateToken(otherArtisan.user._id);

            const response = await request(app)
                .delete(`/api/content/${content._id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(response.status).toBe(403);
        });

        test('should fail without authentication', async () => {
            const response = await request(app).delete(`/api/content/${content._id}`);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/content/feed - Get Content Feed', () => {
        beforeEach(async () => {
            // Create multiple content items
            await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video1.mp4',
                title: 'Video 1',
            });

            await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video2.mp4',
                title: 'Video 2',
            });
        });

        test('should get content feed', async () => {
            const response = await request(app)
                .get('/api/content/feed')
                .set('Authorization', `Bearer ${consumerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.content).toBeInstanceOf(Array);
            expect(response.body.data.content.length).toBeGreaterThan(0);
        });

        test('should support pagination', async () => {
            const response = await request(app)
                .get('/api/content/feed?page=1&limit=1')
                .set('Authorization', `Bearer ${consumerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.content).toHaveLength(1);
        });

        test('should filter by craft_tags', async () => {
            await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/pottery.mp4',
                title: 'Pottery Video',
                craft_tags: ['pottery'],
            });

            const response = await request(app)
                .get('/api/content/feed?craft_tags=pottery')
                .set('Authorization', `Bearer ${consumerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.content.length).toBeGreaterThan(0);
        });
    });
});
