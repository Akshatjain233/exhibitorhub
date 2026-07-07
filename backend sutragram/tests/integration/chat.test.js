import request from 'supertest';
import app from '../../server.js';
import { createTestUser, generateToken, authHeaders } from '../fixtures/helpers.js';
import ChatMessage from '../../models/ChatMessage.js';
import Product from '../../models/Product.js';

describe('Chat Controller', () => {
    let user1, token1, user2, token2, artisan, product;

    beforeEach(async () => {
        const result1 = await createTestUser('consumer', { email: 'user1@test.com' });
        user1 = result1.user;
        token1 = generateToken(user1._id);

        const result2 = await createTestUser('consumer', { email: 'user2@test.com' });
        user2 = result2.user;
        token2 = generateToken(user2._id);

        const artisanResult = await createTestUser('artisan');
        artisan = artisanResult.user;

        product = await Product.create({
            artisan: artisan._id,
            name: 'Test Product',
            price: 500,
            availability: true,
        });
    });

    describe('POST /api/chat/send', () => {
        it('should send a text message', async () => {
            const response = await request(app)
                .post('/api/chat/send')
                .set(authHeaders(token1))
                .send({
                    recipient_id: user2._id,
                    message_type: 'text',
                    content: 'Hello there!',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.message.content).toBe('Hello there!');
            expect(response.body.data.message.sender.toString()).toBe(user1._id.toString());
        });

        it('should send a quote message', async () => {
            const response = await request(app)
                .post('/api/chat/send-quote')
                .set(authHeaders(token1))
                .send({
                    recipient_id: user2._id,
                    product_id: product._id,
                    quantity: 10,
                    price: 450,
                    customization_details: 'Blue color preferred',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.message.message_type).toBe('quote');
            expect(response.body.data.message.quote_data.quantity).toBe(10);
            expect(response.body.data.message.quote_data.price).toBe(450);
        });

        it('should fail without required fields', async () => {
            const response = await request(app)
                .post('/api/chat/send')
                .set(authHeaders(token1))
                .send({ recipient_id: user2._id });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/chat/history/:userId', () => {
        beforeEach(async () => {
            // Create some messages
            await ChatMessage.create([
                { sender: user1._id, recipient: user2._id, message_type: 'text', content: 'Hi' },
                { sender: user2._id, recipient: user1._id, message_type: 'text', content: 'Hello' },
                { sender: user1._id, recipient: user2._id, message_type: 'text', content: 'How are you?' },
            ]);
        });

        it('should get chat history between two users', async () => {
            const response = await request(app)
                .get(`/api/chat/history/${user2._id}`)
                .set(authHeaders(token1));

            expect(response.status).toBe(200);
            expect(response.body.data.messages).toHaveLength(3);
        });

        it('should mark messages as read', async () => {
            const unreadMessage = await ChatMessage.create({
                sender: user2._id,
                recipient: user1._id,
                message_type: 'text',
                content: 'Unread message',
                is_read: false,
            });

            await request(app)
                .get(`/api/chat/history/${user2._id}`)
                .set(authHeaders(token1));

            const updatedMessage = await ChatMessage.findById(unreadMessage._id);
            expect(updatedMessage.is_read).toBe(true);
            expect(updatedMessage.read_at).toBeTruthy();
        });
    });

    describe('GET /api/chat/conversations', () => {
        beforeEach(async () => {
            const user3Result = await createTestUser('consumer', { email: 'user3@test.com' });
            const user3 = user3Result.user;

            await ChatMessage.create([
                { sender: user1._id, recipient: user2._id, message_type: 'text', content: 'Message 1' },
                { sender: user1._id, recipient: user3._id, message_type: 'text', content: 'Message 2' },
                { sender: user2._id, recipient: user1._id, message_type: 'text', content: 'Reply', is_read: false },
            ]);
        });

        it('should get all conversations for a user', async () => {
            const response = await request(app)
                .get('/api/chat/conversations')
                .set(authHeaders(token1));

            expect(response.status).toBe(200);
            expect(response.body.data.conversations).toBeInstanceOf(Array);
            expect(response.body.data.conversations.length).toBeGreaterThan(0);
        });

        it('should include unread count', async () => {
            const response = await request(app)
                .get('/api/chat/conversations')
                .set(authHeaders(token1));

            expect(response.status).toBe(200);
            const conversation = response.body.data.conversations.find(
                c => c.user._id.toString() === user2._id.toString()
            );
            expect(conversation.unreadCount).toBeGreaterThan(0);
        });
    });
});
