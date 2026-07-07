const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const userSocketMap = new Map();

const initializeChatSocket = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                console.error('❌ Socket auth error: No token provided');
                return next(new Error('Authentication error: No token provided'));
            }

            const secret = process.env.JWT_SECRET || 'secret';
            try {
                const decoded = jwt.verify(token, secret);
                const userId = decoded.userId || decoded.id;
                const user = await User.findById(userId).select('-password');

                if (!user) {
                    return next(new Error('User not found'));
                }

                socket.userId = user._id.toString();
                socket.user = user;
                next();
            } catch (verifyError) {
                next(new Error('Invalid token'));
            }
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        userSocketMap.set(userId, socket.id);

        broadcastOnlineStatus(io, userId, socket.user, 'online').catch(err =>
            console.error('Error broadcasting connect status:', err)
        );

        socket.on('join_chat', (chatId) => {
            socket.join(`chat_${chatId}`);
        });

        socket.on('leave_chat', (chatId) => {
            socket.leave(`chat_${chatId}`);
        });

        socket.on('send_message', async (data) => {
            try {
                const { chatId, recipientId, content, type = 'text', tempId } = data;
                
                if (!chatId || !recipientId || !content) {
                    return socket.emit('message_error', { error: 'Missing required fields' });
                }

                const chat = await Chat.findById(chatId);
                if (!chat) return socket.emit('message_error', { error: 'Chat not found' });

                const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
                if (!isParticipant) {
                    return socket.emit('message_error', { error: 'Not a participant' });
                }

                const message = new Message({
                    conversation: chatId,
                    sender: userId,
                    recipient: recipientId,
                    content,
                    type,
                    is_read: false,
                });

                await message.save();
                await message.populate('sender', 'name');

                chat.lastMessage = message._id;
                chat.lastMessageAt = new Date();
                
                if (typeof chat.incrementUnreadCount === 'function') {
                    await chat.incrementUnreadCount(recipientId);
                } else {
                    await chat.save();
                }

                const senderSocketId = userSocketMap.get(userId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('message_sent_confirmed', {
                        _id: message._id,
                        chatId,
                        sender: message.sender,
                        content,
                        type,
                        createdAt: message.createdAt,
                        tempId,
                    });
                }

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
                }

                io.to(`chat_${chatId}`).emit('new_message', {
                    _id: message._id,
                    chatId,
                    sender: message.sender,
                    content,
                    type,
                    createdAt: message.createdAt,
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('mark_as_read', async (data) => {
            try {
                const { chatId } = data;
                const chat = await Chat.findById(chatId);
                if (!chat) return;

                const otherUserId = chat.participants.find(p => p.toString() !== userId.toString());

                await Message.updateMany(
                    { conversation: chatId, sender: otherUserId, is_read: false },
                    { $set: { is_read: true, read_at: new Date() } }
                );

                if (typeof chat.resetUnreadCount === 'function') {
                    await chat.resetUnreadCount(userId);
                }

                const senderSocketId = userSocketMap.get(otherUserId.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messages_read', { chatId, readBy: userId });
                }
                socket.emit('read_confirmed', { chatId });
            } catch (error) {}
        });

        socket.on('disconnect', async () => {
            userSocketMap.delete(userId);
            try {
                const user = await User.findById(userId);
                if (user) await broadcastOnlineStatus(io, userId, user, 'offline');
            } catch (error) {}
        });
    });

    return io;
};

async function broadcastOnlineStatus(io, userId, user, status) {
    try {
        const userChats = await Chat.find({ participants: userId }).select('participants');

        for (const chat of userChats) {
            const otherParticipant = chat.participants.find(p => p.toString() !== userId.toString());
            if (otherParticipant) {
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
    } catch (error) {}
}

const getUserSocketId = (userId) => userSocketMap.get(userId) || null;
const getConnectedUsers = () => new Map(userSocketMap);

module.exports = {
    initializeChatSocket,
    getUserSocketId,
    getConnectedUsers
};
