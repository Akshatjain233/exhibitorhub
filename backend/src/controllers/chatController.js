const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

exports.sendMessage = async (req, res, next) => {
    try {
        const { recipient_id, content, type = 'text' } = req.body;

        if (!recipient_id || !content) {
            return errorResponse(res, 400, 'Recipient and content are required.');
        }

        const recipient = await User.findById(recipient_id);
        if (!recipient) {
            return errorResponse(res, 404, 'Recipient not found.');
        }

        // Find or create chat
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, recipient_id] },
        });

        if (!chat) {
            chat = new Chat({
                participants: [req.user._id, recipient_id],
                unreadCounts: { [req.user._id.toString()]: 0, [recipient_id.toString()]: 0 },
            });
            await chat.save();
        }

        const message = await Message.create({
            conversation: chat._id,
            sender: req.user._id,
            recipient: recipient_id,
            content,
            type,
        });

        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        if (typeof chat.incrementUnreadCount === 'function') {
            await chat.incrementUnreadCount(recipient_id);
        } else {
            await chat.save();
        }

        return successResponse(res, 201, 'Message sent successfully.', { message });
    } catch (error) { next(error); }
};

exports.getChats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({
            participants: userId,
            archivedBy: { $ne: userId },
        })
        .populate('participants', 'name email role')
        .populate('lastMessage', 'content sender createdAt type')
        .sort({ lastMessageAt: -1 });

        const transformedChats = chats.map((chat) => {
            let otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());
            return {
                _id: chat._id,
                otherParticipant,
                lastMessage: chat.lastMessage,
                unreadCount: typeof chat.getUnreadCount === 'function' ? chat.getUnreadCount(userId) : 0,
                isMuted: typeof chat.isMutedFor === 'function' ? chat.isMutedFor(userId) : false,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
            };
        }).filter(Boolean);

        return successResponse(res, 200, 'Chats retrieved', transformedChats);
    } catch (error) { next(error); }
};

exports.getChatMessages = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const chat = await Chat.findById(chatId);
        if (!chat) return errorResponse(res, 404, 'Chat not found');

        const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
        if (!isParticipant) return errorResponse(res, 403, 'You are not a participant in this chat');

        const messages = await Message.find({ conversation: chatId })
            .populate('sender', 'name role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await Message.countDocuments({ conversation: chatId });

        return successResponse(res, 200, 'Messages retrieved', {
            messages: messages.reverse(),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
            },
        });
    } catch (error) { next(error); }
};

exports.getOrCreateChat = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { participantId } = req.params;

        if (userId.toString() === participantId.toString()) {
            return errorResponse(res, 400, 'You cannot chat with yourself');
        }

        const otherUser = await User.findById(participantId).select('name role is_active');
        if (!otherUser) return errorResponse(res, 404, 'User not found');

        let chat = await Chat.findOne({
            participants: { $all: [userId, participantId] },
        }).populate('lastMessage');

        if (!chat) {
            chat = new Chat({
                participants: [userId, participantId],
                unreadCounts: { [userId.toString()]: 0, [participantId.toString()]: 0 },
            });
            await chat.save();
        }

        await chat.populate('participants', 'name role');

        return successResponse(res, 200, 'Chat retrieved/created', {
            _id: chat._id,
            otherParticipant: otherUser,
            lastMessage: chat.lastMessage,
            unreadCount: typeof chat.getUnreadCount === 'function' ? chat.getUnreadCount(userId) : 0,
        });
    } catch (error) { next(error); }
};
