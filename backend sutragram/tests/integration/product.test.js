import request from 'supertest';
import app from '../../server.js';
import { createTestUser, generateToken, authHeaders } from '../fixtures/helpers.js';
import Product from '../../models/Product.js';
import CraftTag from '../../models/CraftTag.js';

describe('Product Controller', () => {
    let artisan, artisanToken, consumer, consumerToken, craftTag;

    beforeEach(async () => {
        // Create test users
        const artisanResult = await createTestUser('artisan', { email: 'artisan@test.com' });
        artisan = artisanResult.user;
        artisanToken = generateToken(artisan._id);

        const consumerResult = await createTestUser('consumer', { email: 'consumer@test.com' });
        consumer = consumerResult.user;
        consumerToken = generateToken(consumer._id);

        // Create a craft tag
        craftTag = await CraftTag.create({
            name_english: 'Pottery',
            name_vernacular: 'मिट्टी के बर्तन',
            type: 'craft',
        });
    });

    describe('POST /api/products', () => {
        it('should create a product successfully (artisan)', async () => {
            const productData = {
                name: 'Handmade Clay Pot',
                price: 500,
                description: 'Beautiful handcrafted pot',
                category: 'Pottery',
                availability: true,
                customization_options: { color: ['red', 'blue'], size: ['small', 'large'] },
                images: ['https://example.com/image1.jpg'],
            };

            const response = await request(app)
                .post('/api/products')
                .set(authHeaders(artisanToken))
                .send(productData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.product.name).toBe(productData.name);
            expect(response.body.data.product.price).toBe(productData.price);
            expect(response.body.data.product.artisan.toString()).toBe(artisan._id.toString());
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({ name: 'Test Product', price: 100 });

            expect(response.status).toBe(401);
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/products')
                .set(authHeaders(artisanToken))
                .send({ description: 'No name or price' });

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/required/i);
        });
    });

    describe('GET /api/products/:productId', () => {
        it('should get product by ID', async () => {
            const product = await Product.create({
                artisan: artisan._id,
                name: 'Test Product',
                price: 300,
                description: 'Test description',
            });

            const response = await request(app).get(`/api/products/${product._id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.product.name).toBe('Test Product');
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app).get(`/api/products/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/products/:productId', () => {
        it('should update product (owner only)', async () => {
            const product = await Product.create({
                artisan: artisan._id,
                name: 'Original Name',
                price: 200,
            });

            const response = await request(app)
                .put(`/api/products/${product._id}`)
                .set(authHeaders(artisanToken))
                .send({ name: 'Updated Name', price: 250 });

            expect(response.status).toBe(200);
            expect(response.body.data.product.name).toBe('Updated Name');
            expect(response.body.data.product.price).toBe(250);
        });

        it('should fail when non-owner tries to update', async () => {
            const product = await Product.create({
                artisan: artisan._id,
                name: 'Original Name',
                price: 200,
            });

            const response = await request(app)
                .put(`/api/products/${product._id}`)
                .set(authHeaders(consumerToken))
                .send({ name: 'Hacked Name' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/products/:productId', () => {
        it('should delete product (owner only)', async () => {
            const product = await Product.create({
                artisan: artisan._id,
                name: 'To Delete',
                price: 100,
            });

            const response = await request(app)
                .delete(`/api/products/${product._id}`)
                .set(authHeaders(artisanToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify deletion
            const deletedProduct = await Product.findById(product._id);
            expect(deletedProduct).toBeNull();
        });

        it('should fail when non-owner tries to delete', async () => {
            const product = await Product.create({
                artisan: artisan._id,
                name: 'To Delete',
                price: 100,
            });

            const response = await request(app)
                .delete(`/api/products/${product._id}`)
                .set(authHeaders(consumerToken));

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/products', () => {
        beforeEach(async () => {
            // Create multiple products
            await Product.create([
                { artisan: artisan._id, name: 'Product 1', price: 100, category: 'Pottery', availability: true },
                { artisan: artisan._id, name: 'Product 2', price: 200, category: 'Textiles', availability: true },
                { artisan: artisan._id, name: 'Product 3', price: 300, category: 'Pottery', availability: false },
            ]);
        });

        it('should get all products with pagination', async () => {
            const response = await request(app).get('/api/products?page=1&limit=10');

            expect(response.status).toBe(200);
            expect(response.body.data.products).toBeInstanceOf(Array);
            expect(response.body.data.pagination).toHaveProperty('total');
        });

        it('should filter products by category', async () => {
            const response = await request(app).get('/api/products?category=Pottery');

            expect(response.status).toBe(200);
            expect(response.body.data.products.every(p => p.category === 'Pottery')).toBe(true);
        });

        it('should search products by name', async () => {
            const response = await request(app).get('/api/products?search=Product 1');

            expect(response.status).toBe(200);
            expect(response.body.data.products.length).toBeGreaterThan(0);
            expect(response.body.data.products[0].name).toMatch(/Product 1/);
        });
    });
});
