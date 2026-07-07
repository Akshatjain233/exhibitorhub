import { jest, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import Content from '../../../models/Post.js';
import { createTestUser } from '../../fixtures/helpers.js';

describe('Content Model - Exhaustive Tests', () => {
    let artisan;

    beforeAll(async () => {
        const result = await createTestUser('artisan');
        artisan = result.user;
    });

    describe('Schema Validation', () => {
        test('should create content with required fields', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test Content',
                description: 'Test description',
                craft_tags: ['pottery'],
            });

            expect(content.artisan.toString()).toBe(artisan._id.toString());
            expect(content.content_type).toBe('video');
            expect(content.is_live).toBe(true);
        });

        test('should fail when artisan is missing', async () => {
            await expect(
                Content.create({
                    content_type: 'video',
                    media_url: 'https://example.com/video.mp4',
                    title: 'Test',
                })
            ).rejects.toThrow();
        });

        test('should fail when content_type is missing', async () => {
            await expect(
                Content.create({
                    artisan: artisan._id,
                    media_url: 'https://example.com/video.mp4',
                    title: 'Test',
                })
            ).rejects.toThrow();
        });

        test('should fail when media_url is missing', async () => {
            await expect(
                Content.create({
                    artisan: artisan._id,
                    content_type: 'video',
                    title: 'Test',
                })
            ).rejects.toThrow();
        });

        test('should accept valid content_types', async () => {
            const types = ['video', 'image', 'carousel'];

            for (const type of types) {
                const content = await Content.create({
                    artisan: artisan._id,
                    content_type: type,
                    media_url: 'https://example.com/media.jpg',
                    title: `Test ${type}`,
                });

                expect(content.content_type).toBe(type);
            }
        });

        test('should reject invalid content_type', async () => {
            await expect(
                Content.create({
                    artisan: artisan._id,
                    content_type: 'audio',
                    media_url: 'https://example.com/audio.mp3',
                    title: 'Test',
                })
            ).rejects.toThrow();
        });

        test('should set default values correctly', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
            });

            expect(content.is_live).toBe(true);
            expect(content.views_count).toBe(0);
            expect(content.likes_count).toBe(0);
            expect(content.comments_count).toBe(0);
            expect(content.shares_count).toBe(0);
        });

        test('should store optional fields when provided', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test Video',
                description: 'A detailed description',
                thumbnail_url: 'https://example.com/thumb.jpg',
                duration: 120,
                craft_tags: ['pottery', 'handmade'],
                location: 'Jaipur, Rajasthan',
                product_links: ['product1', 'product2'],
            });

            expect(content.description).toBe('A detailed description');
            expect(content.thumbnail_url).toBe('https://example.com/thumb.jpg');
            expect(content.duration).toBe(120);
            expect(content.craft_tags).toHaveLength(2);
            expect(content.product_links).toHaveLength(2);
        });

        test('should handle empty arrays for craft_tags', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'image',
                media_url: 'https://example.com/image.jpg',
                title: 'Test',
                craft_tags: [],
            });

            expect(content.craft_tags).toHaveLength(0);
        });

        test('should increment views_count', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
            });

            content.views_count += 1;
            await content.save();

            expect(content.views_count).toBe(1);
        });

        test('should increment likes_count', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
            });

            content.likes_count += 1;
            await content.save();

            expect(content.likes_count).toBe(1);
        });
    });

    describe('Indexes', () => {
        test('should have index on artisan', async () => {
            const indexes = Content.schema.indexes();
            const artisanIndex = indexes.find((idx) => idx[0].artisan);

            expect(artisanIndex).toBeDefined();
        });

        test('should have index on craft_tags', async () => {
            const indexes = Content.schema.indexes();
            const tagsIndex = indexes.find((idx) => idx[0].craft_tags);

            expect(tagsIndex).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        test('should handle very long title (500 chars)', async () => {
            const longTitle = 'A'.repeat(500);

            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: longTitle,
            });

            expect(content.title).toBe(longTitle);
        });

        test('should handle very long description (5000 chars)', async () => {
            const longDescription = 'B'.repeat(5000);

            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
                description: longDescription,
            });

            expect(content.description).toBe(longDescription);
        });

        test('should handle unicode in title and description', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'मिट्टी के बर्तन 🏺',
                description: 'हाथ से बनाए गए मिट्टी के बर्तन',
            });

            expect(content.title).toBe('मिट्टी के बर्तन 🏺');
        });

        test('should handle large number of craft_tags', async () => {
            const tags = Array(50)
                .fill(null)
                .map((_, i) => `tag${i}`);

            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
                craft_tags: tags,
            });

            expect(content.craft_tags).toHaveLength(50);
        });

        test('should handle negative duration (boundary test)', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
                duration: -1,
            });

            expect(content.duration).toBe(-1); // Model doesn't validate min
        });

        test('should handle very large duration (10000 seconds)', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
                duration: 10000,
            });

            expect(content.duration).toBe(10000);
        });

        test('should handle is_live toggle', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
                is_live: false,
            });

            expect(content.is_live).toBe(false);

            content.is_live = true;
            await content.save();

            expect(content.is_live).toBe(true);
        });
    });

    describe('Timestamps', () => {
        test('should auto-generate createdAt', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
            });

            expect(content.createdAt).toBeInstanceOf(Date);
        });

        test('should update updatedAt on modification', async () => {
            const content = await Content.create({
                artisan: artisan._id,
                content_type: 'video',
                media_url: 'https://example.com/video.mp4',
                title: 'Test',
            });

            const originalUpdatedAt = content.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 100));

            content.title = 'Updated Title';
            await content.save();

            expect(content.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });
    });
});
