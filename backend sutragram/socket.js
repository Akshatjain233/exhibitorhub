import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

/**
 * In-memory map to track active user socket connections
 * Structure: { userId: socketId }
 */
const userSocketMap = new Map();

/**
 * Initialize Socket.io with chat functionality
 * @param {Server} io - Socket.io server instance
 */
export const initializeChatSocket = (io) => {
    // Socket.IO Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                console.error('❌ Socket auth error: No token provided');
                return next(new Error('Authentication error: No token provided'));
            }

            const secret = process.env.JWT_SECRET || 'test-secret';
            try {
                const decoded = jwt.verify(token, secret);
                const userId = decoded.userId || decoded.id; // Handle both userId and id fields
                const user = await User.findById(userId).select('-password_hash');

                if (!user) {
                    console.error(`❌ Socket auth error: User not found for userId: ${userId}`);
                    return next(new Error('User not found'));
                }

                socket.userId = user._id.toString();
                socket.user = user;
                console.log(`✅ Socket authenticated for user: ${userId}`);
                next();
            } catch (verifyError) {
                console.error('❌ Socket JWT verification failed:', verifyError.message);
                next(new Error('Invalid token'));
            }
        } catch (error) {
            console.error('Socket auth error:', error.message);
            next(new Error('Authentication error'));
        }
    });

    // Main connection handler
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`✅ User connected: ${userId}`);

        // Register user's socket connection
        userSocketMap.set(userId, socket.id);

        // Broadcast online status to chat partners if privacy enabled
        broadcastOnlineStatus(io, userId, socket.user, 'online').catch(err =>
            console.error('Error broadcasting connect status:', err)
        );

        /**
         * Join a specific chat room
         * Allows multiple users to receive messages sent to that chat
         */
        socket.on('join_chat', (chatId) => {
            socket.join(`chat_${chatId}`);
            console.log(`User ${userId} joined chat room ${chatId}`);
        });

        /**
         * Leave a specific chat room
         */
        socket.on('leave_chat', (chatId) => {
            socket.leave(`chat_${chatId}`);
            console.log(`User ${userId} left chat room ${chatId}`);
        });

        /**
         * Send a message
         * Saves to database and broadcasts to recipient
         */
        socket.on('send_message', async (data) => {
            try {
                const { chatId, recipientId, content, type = 'text', tempId } = data;
                console.log('📨 Received send_message event:', {
                    userId,
                    chatId,
                    recipientId,
                    tempId,
                    contentLength: content?.length,
                });

                // Validation
                if (!chatId || !recipientId || !content) {
                    console.error('❌ Missing required fields:', { chatId, recipientId, hasContent: !!content });
                    socket.emit('message_error', {
                        error: 'Missing required fields: chatId, recipientId, content',
                    });
                    return;
                }

                // Verify user is participant in the chat
                const chat = await Chat.findById(chatId);
                if (!chat) {
                    console.error('❌ Chat not found:', chatId);
                    socket.emit('message_error', { error: 'Chat not found' });
                    return;
                }

                const isParticipant = chat.participants.some(
                    (p) => p.toString() === userId.toString()
                );

                if (!isParticipant) {
                    console.error('❌ User not a participant:', {
                        userId,
                        chatId,
                        participants: chat.participants.map(p => p.toString()),
                    });
                    socket.emit('message_error', {
                        error: 'You are not a participant in this chat',
                        chatId, // Include chatId in error for debugging
                    });
                    return;
                }

                // Create and save message
                const message = new Message({
                    conversation: chatId,
                    sender: userId,
                    recipient: recipientId,
                    content,
                    type,
                    is_read: false,
                });

                await message.save();

                // Populate sender info with both profile picture fields
                await message.populate('sender', 'name profile_image_url profile_picture');

                // Normalize sender profile picture fields
                if (message.sender) {
                    if (message.sender.profile_picture && !message.sender.profile_image_url) {
                        message.sender.profile_image_url = message.sender.profile_picture;
                    } else if (message.sender.profile_image_url && !message.sender.profile_picture) {
                        message.sender.profile_picture = message.sender.profile_image_url;
                    }
                }

                // Update chat with last message info
                chat.lastMessage = message._id;
                chat.lastMessageAt = new Date();

                // Increment unread count for recipient
                if (typeof chat.incrementUnreadCount === 'function') {
                    await chat.incrementUnreadCount(recipientId);
                }

                await chat.save();

                // Emit to sender - use socket ID not user ID
                const senderSocketId = userSocketMap.get(userId);
                if (senderSocketId) {
                    console.log('✅ Sending message_sent_confirmed with tempId:', tempId, 'realId:', message._id.toHexString?.() || message._id);
                    io.to(senderSocketId).emit('message_sent_confirmed', {
                        _id: message._id,
                        chatId,
                        sender: message.sender,
                        content,
                        type,
                        createdAt: message.createdAt,
                        tempId, // Echo back the temporary ID so client can match it
                    });
                }

                // Send to recipient - use socket ID
                const recipientSocketId = userSocketMap.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('receive_message', {
                        _id: message._id,
                        chatId,
                        sender: message.sender,
                        content,
                        type,
                        createdAt: message.createdAt,
                        isRead: false,
                    });
                } else {
                    // Recipient is offline - message is saved in DB, will be fetched on reconnect
                    console.log(`Recipient ${recipientId} is offline. Message saved.`);
                }

                // Broadcast to chat room (both participants if in same room)
                io.to(`chat_${chatId}`).emit('new_message', {
                    _id: message._id,
                    chatId,
                    sender: message.sender,
                    content,
                    type,
                    createdAt: message.createdAt,
                });

                console.log(`✅ Message sent: ${userId} → ${recipientId} in chat ${chatId}`);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        /**
         * Mark messages as read
         * Updates message status and resets unread count
         */
        socket.on('mark_as_read', async (data) => {
            try {
                const { chatId } = data;

                const chat = await Chat.findById(chatId);
                if (!chat) return;

                // Update all unread messages
                const otherUserId = chat.participants.find(
                    (p) => p.toString() !== userId.toString()
                );

                await Message.updateMany(
                    {
                        conversation: chatId,
                        sender: otherUserId,
                        is_read: false,
                    },
                    {
                        $set: {
                            is_read: true,
                            read_at: new Date(),
                        },
                    }
                );

                // Reset unread count
                await chat.resetUnreadCount(userId);

                // Emit read receipt to sender
                const senderSocketId = userSocketMap.get(otherUserId.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messages_read', {
                        chatId,
                        readBy: userId,
                    });
                }

                socket.emit('read_confirmed', { chatId });
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        });

        /**
         * Typing indicators
         * Send typing start/stop to recipient
         */
        socket.on('typing_start', async (data) => {
            try {
                const { chatId, recipientId } = data;

                const recipientSocketId = userSocketMap.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('user_typing', {
                        chatId,
                        userId,
                    });
                }
            } catch (error) {
                console.error('Error sending typing indicator:', error);
            }
        });

        /**
         * Stop typing indicator
         */
        socket.on('typing_stop', async (data) => {
            try {
                const { chatId, recipientId } = data;

                const recipientSocketId = userSocketMap.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('user_stopped_typing', {
                        chatId,
                        userId,
                    });
                }
            } catch (error) {
                console.error('Error stopping typing indicator:', error);
            }
        });

        /**
         * Handle user going online
         * Respects privacy setting for online presence
         */
        socket.on('user_online', async () => {
            try {
                const user = await User.findById(userId);
                broadcastOnlineStatus(io, userId, user, 'online');
            } catch (error) {
                console.error('Error handling user_online:', error);
            }
        });

        /**
         * Handle user going offline
         * Respects privacy setting for online presence
         */
        socket.on('user_offline', async () => {
            try {
                const user = await User.findById(userId);
                broadcastOnlineStatus(io, userId, user, 'offline');
            } catch (error) {
                console.error('Error handling user_offline:', error);
            }
        });

        /**
         * Handle disconnect
         */
        socket.on('disconnect', async () => {
            console.log(`❌ User disconnected: ${userId}`);

            // Remove from socket map
            userSocketMap.delete(userId);

            // Broadcast offline status
            try {
                const user = await User.findById(userId);
                if (user) {
                    await broadcastOnlineStatus(io, userId, user, 'offline');
                }
            } catch (error) {
                console.error('Error broadcasting disconnect:', error);
            }
        });

        /**
         * Error handler
         */
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

/**
 * Broadcast online/offline status to chat partners
 * Respects user's privacy setting (isOnlinePresencePublic)
 * @param {Server} io - Socket.io server instance
 * @param {string} userId - User ID
 * @param {Object} user - User document
 * @param {string} status - 'online' or 'offline'
 */
async function broadcastOnlineStatus(io, userId, user, status) {
    try {
        // Only broadcast if user has enabled public online presence
        if (!user || !user.isOnlinePresencePublic) {
            console.log(`User ${userId} has disabled online presence broadcasting`);
            return;
        }

        // Find all chats involving this user
        const userChats = await Chat.find({
            participants: userId,
        }).select('participants');

        // Broadcast to each chat partner
        for (const chat of userChats) {
            const otherParticipant = chat.participants.find(
                (p) => p.toString() !== userId.toString()
            );

            if (otherParticipant) {
                // Send to user's personal room and/or direct socket
                const partnerSocketId = userSocketMap.get(otherParticipant.toString());
                if (partnerSocketId) {
                    io.to(partnerSocketId).emit('user_status_changed', {
                        userId,
                        status,
                        chatId: chat._id,
                    });
                }
            }
        }

        console.log(`Broadcasted ${status} status for user ${userId} to chat partners`);
    } catch (error) {
        console.error('Error broadcasting online status:', error);
    }
}

/**
 * Get the socket ID for a user
 * Useful for the app to check if a user is online
 * @param {string} userId - User ID
 * @returns {string|null} Socket ID or null if offline
 */
export const getUserSocketId = (userId) => {
    return userSocketMap.get(userId) || null;
};

/**
 * Get all connected users
 * @returns {Object} Map of userId to socketId
 */
export const getConnectedUsers = () => {
    return new Map(userSocketMap);
};

export default initializeChatSocket;
