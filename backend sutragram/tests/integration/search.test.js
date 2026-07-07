import request from 'supertest';
import app from '../../server.js';
import { createTestUser, generateToken, authHeaders } from '../fixtures/helpers.js';
import CraftTag from '../../models/CraftTag.js';
import ArtisanProfile from '../../models/ArtisanProfile.js';
import Video from '../../models/Video.js';
import Product from '../../models/Product.js';
import RawMaterial from '../../models/RawMaterial.js';

describe('Search Controller', () => {
    let artisan, consumer, consumerToken, craftTag, video, product, material;

    beforeEach(async () => {
        // Create craft tag
        craftTag = await CraftTag.create({
            name_english: 'Pottery',
            name_vernacular: 'मिट्टी के बर्तन',
            type: 'craft',
        });

        // Create artisan
        const artisanResult = await createTestUser('artisan');
        artisan = artisanResult.user;

        // Update artisan profile
        await ArtisanProfile.findOneAndUpdate(
            { user: artisan._id },
            {
                craft_tags: [craftTag._id],
                bio_text: 'Master potter from Delhi',
                location_city: 'Delhi',
            }
        );

        // Create content
        video = await Video.create({
            artisan: artisan._id,
            video_url_1080p: 'https://s3.amazonaws.com/video1.mp4',
            description: 'Beautiful pottery demonstration',
            tags: [{ tag: craftTag._id, is_ai_generated: false }],
        });

        // Create product
        product = await Product.create({
            artisan: artisan._id,
            name: 'Handmade Clay Pot',
            price: 500,
            description: 'Beautiful pottery piece',
            category: 'Pottery',
            availability: true,
        });

        // Create raw material
        const sellerResult = await createTestUser('trader');
        material = await RawMaterial.create({
            seller: sellerResult.user._id,
            name: 'Premium Clay',
            category: 'Raw Materials',
            description: 'High quality clay for pottery',
        });

        const consumerResult = await createTestUser('consumer');
        consumer = consumerResult.user;
        consumerToken = generateToken(consumer._id);
    });

    describe('GET /api/search', () => {
        it('should search across all types', async () => {
            const response = await request(app).get('/api/search?query=pottery&type=all');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('videos');
            expect(response.body.data).toHaveProperty('artisans');
            expect(response.body.data).toHaveProperty('products');
            expect(response.body.data).toHaveProperty('materials');
        });

        it('should search only content', async () => {
            const response = await request(app).get('/api/search?query=pottery&type=content');

            expect(response.status).toBe(200);
            expect(response.body.data.videos).toBeDefined();
            expect(response.body.data.artisans).toBeUndefined();
        });

        it('should search only products', async () => {
            const response = await request(app).get('/api/search?query=clay&type=products');

            expect(response.status).toBe(200);
            expect(response.body.data.products).toBeDefined();
            expect(response.body.data.products.length).toBeGreaterThan(0);
        });

        it('should search only artisans', async () => {
            const response = await request(app).get('/api/search?query=delhi&type=artisans');

            expect(response.status).toBe(200);
            expect(response.body.data.artisans).toBeDefined();
            expect(response.body.data.artisans.length).toBeGreaterThan(0);
        });

        it('should fail without query', async () => {
            const response = await request(app).get('/api/search');

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/query.*required/i);
        });
    });

    describe('GET /api/search/crafts', () => {
        beforeEach(async () => {
            await CraftTag.create([
                { name_english: 'Weaving', name_vernacular: 'बुनाई', type: 'craft' },
                { name_english: 'Metalwork', name_vernacular: 'धातु का काम', type: 'craft' },
            ]);
        });

        it('should search craft tags', async () => {
            const response = await request(app).get('/api/search/crafts?query=pottery');

            expect(response.status).toBe(200);
            expect(response.body.data.crafts.length).toBeGreaterThan(0);
            expect(response.body.data.crafts.some(c => c.name_english.match(/pottery/i))).toBe(true);
        });

        it('should search in vernacular names', async () => {
            const response = await request(app).get('/api/search/crafts?query=बुनाई');

            expect(response.status).toBe(200);
            expect(response.body.data.crafts.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/search/artisans/location', () => {
        beforeEach(async () => {
            const mumbaiArtisan = await createTestUser('artisan', { email: 'mumbai@test.com' });
            await ArtisanProfile.findOneAndUpdate(
                { user: mumbaiArtisan.user._id },
                { location_city: 'Mumbai', location_state: 'Maharashtra', location_region: 'West' }
            );

            const bangaloreArtisan = await createTestUser('artisan', { email: 'bangalore@test.com' });
            await ArtisanProfile.findOneAndUpdate(
                { user: bangaloreArtisan.user._id },
                { location_city: 'Bangalore', location_state: 'Karnataka', location_region: 'South' }
            );
        });

        it('should search artisans by city', async () => {
            const response = await request(app).get('/api/search/artisans/location?city=Delhi');

            expect(response.status).toBe(200);
            expect(response.body.data.artisans.length).toBeGreaterThan(0);
            expect(response.body.data.artisans[0].location_city).toMatch(/delhi/i);
        });

        it('should search artisans by region', async () => {
            const response = await request(app).get('/api/search/artisans/location?region=West');

            expect(response.status).toBe(200);
            expect(response.body.data.artisans.length).toBeGreaterThan(0);
        });

        it('should search artisans by state', async () => {
            const response = await request(app).get('/api/search/artisans/location?state=Maharashtra');

            expect(response.status).toBe(200);
            expect(response.body.data.artisans.length).toBeGreaterThan(0);
        });
    });
});
