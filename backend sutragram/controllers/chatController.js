import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { recipient_id, message_type, content, quote_data } = req.body;

        if (!recipient_id || !message_type || !content) {
            return res.status(400).json({
                success: false,
                message: 'Recipient, message type, and content are required.',
            });
        }

        // Verify recipient exists
        const recipient = await User.findById(recipient_id);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found.',
            });
        }

        const messageData = {
            sender: req.user._id,
            recipient: recipient_id,
            message_type,
            content,
        };

        if (quote_data && message_type === 'quote') {
            messageData.quote_data = quote_data;
        }

        const message = await ChatMessage.create(messageData);

        // In production, trigger real-time notification via WebSocket/Socket.io
        // For now, we'll just save the message

        res.status(201).json({
            success: true,
            message: 'Message sent successfully.',
            data: { message },
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message.',
            error: error.message,
        });
    }
};

// @desc    Get chat history between two users
// @route   GET /api/chat/history/:userId
// @access  Private
export const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await ChatMessage.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id },
            ],
        })
            .populate('sender', 'name')
            .populate('recipient', 'name')
            .populate('quote_data.product_id', 'name price')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Mark messages as read
        await ChatMessage.updateMany(
            {
                sender: userId,
                recipient: req.user._id,
                is_read: false,
            },
            {
                is_read: true,
                read_at: new Date(),
            }
        );

        const total = await ChatMessage.countDocuments({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id },
            ],
        });

        res.status(200).json({
            success: true,
            data: {
                messages: messages.reverse(), // Return in chronological order
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat history.',
            error: error.message,
        });
    }
};

// @desc    Get all conversations (list of users I've chatted with)
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        // Aggregate to get unique users and latest message
        const conversations = await ChatMessage.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(req.user._id) },
                        { recipient: new mongoose.Types.ObjectId(req.user._id) },
                    ],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', new mongoose.Types.ObjectId(req.user._id)] },
                            '$recipient',
                            '$sender',
                        ],
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$recipient', new mongoose.Types.ObjectId(req.user._id)] },
                                        { $eq: ['$is_read', false] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    user: {
                        _id: 1,
                        name: 1,
                        role: 1,
                    },
                    lastMessage: 1,
                    unreadCount: 1,
                },
            },
            {
                $sort: { 'lastMessage.createdAt': -1 },
            },
        ]);

        res.status(200).json({
            success: true,
            data: { conversations },
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations.',
            error: error.message,
        });
    }
};

// @desc    Send custom quote
// @route   POST /api/chat/send-quote
// @access  Private (artisan only)
export const sendCustomQuote = async (req, res) => {
    try {
        const { recipient_id, product_id, quantity, price, customization_details } = req.body;

        if (!recipient_id || !product_id || !quantity || !price) {
            return res.status(400).json({
                success: false,
                message: 'Recipient, product, quantity, and price are required.',
            });
        }

        const message = await ChatMessage.create({
            sender: req.user._id,
            recipient: recipient_id,
            message_type: 'quote',
            content: `Custom quote for ${quantity} items at ₹${price} each`,
            quote_data: {
                product_id,
                quantity,
                price,
                customization_details,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Quote sent successfully.',
            data: { message },
        });
    } catch (error) {
        console.error('Send custom quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send quote.',
            error: error.message,
        });
    }
};

/**
 * Get all chats for the authenticated user
 * Sorted by most recent message first, includes other participant details
 */
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({
            participants: userId,
            archivedBy: { $ne: userId }, // Exclude archived chats
        })
            .populate({
                path: 'participants',
                select: 'name profile_image_url profile_picture isOnlinePresencePublic',
            })
            .populate({
                path: 'lastMessage',
                select: 'content sender createdAt type',
            })
            .sort({ lastMessageAt: -1 })
            .exec();

        // Transform the response: include the other participant and unread count
        const transformedChats = chats
            .map((chat) => {
                let otherParticipant = chat.participants.find(
                    (p) => p._id.toString() !== userId.toString()
                );
                
                // Skip chats where other participant is missing (deleted user, etc.)
                if (!otherParticipant) {
                    console.warn('⚠️  Chat missing other participant:', chat._id);
                    return null;
                }
                
                // Normalize profile picture fields
                if (otherParticipant.profile_picture && !otherParticipant.profile_image_url) {
                    otherParticipant.profile_image_url = otherParticipant.profile_picture;
                } else if (otherParticipant.profile_image_url && !otherParticipant.profile_picture) {
                    otherParticipant.profile_picture = otherParticipant.profile_image_url;
                }
                
                return {
                    _id: chat._id,
                    otherParticipant,
                    lastMessage: chat.lastMessage,
                    unreadCount: chat.getUnreadCount(userId),
                    isMuted: chat.isMutedFor(userId),
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt,
                };
            })
            .filter(chat => chat !== null); // Remove null entries

        res.status(200).json({
            success: true,
            data: transformedChats,
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chats',
            error: error.message,
        });
    }
};

/**
 * Get or create a 1-on-1 chat with another user
 * Returns the chat along with basic info about the other participant
 */
export const getOrCreateChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { participantId } = req.params;

        // Validation: Cannot chat with self
        if (userId.toString() === participantId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot start a chat with yourself',
            });
        }

        // Validate that participantId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(participantId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid participant ID',
            });
        }

        // Ensure the other user exists
        const otherUser = await User.findById(participantId).select(
            'name profile_image_url profile_picture isOnlinePresencePublic is_active'
        );

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!otherUser.is_active) {
            return res.status(403).json({
                success: false,
                message: 'This user is not active',
            });
        }

        // Find existing chat between the two users
        // Note: participants is an array, so we search for both user IDs
        let chat = await Chat.findOne({
            participants: { $all: [userId, participantId] },
        })
            .populate('lastMessage')
            .exec();

        // If no chat exists, create one
        if (!chat) {
            chat = new Chat({
                participants: [userId, participantId],
                lastMessage: null,
                lastMessageAt: null,
                unreadCounts: {
                    [userId.toString()]: 0,
                    [participantId.toString()]: 0,
                },
            });

            await chat.save();
        }

        // Populate participants for the response
        await chat.populate({
            path: 'participants',
            select: 'name profile_image_url profile_picture isOnlinePresencePublic',
        });

        res.status(200).json({
            success: true,
            data: {
                _id: chat._id,
                otherParticipant: otherUser,
                lastMessage: chat.lastMessage,
                unreadCount: chat.getUnreadCount(userId),
            },
        });
    } catch (error) {
        console.error('Error getting or creating chat:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get or create chat',
            error: error.message,
        });
    }
};

/**
 * Get paginated messages for a specific chat
 */
export const getChatMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Validate chat ID
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID',
            });
        }

        // Verify user is a participant in this chat
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        const isParticipant = chat.participants.some(
            (p) => p.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this chat',
            });
        }

        // Fetch messages with pagination
        let messages = await Message.find({ conversation: chatId })
            .populate('sender', 'name profile_image_url profile_picture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        // Normalize profile picture fields for all messages
        messages = messages.map(msg => {
            if (msg.sender) {
                if (msg.sender.profile_picture && !msg.sender.profile_image_url) {
                    msg.sender.profile_image_url = msg.sender.profile_picture;
                } else if (msg.sender.profile_image_url && !msg.sender.profile_picture) {
                    msg.sender.profile_picture = msg.sender.profile_image_url;
                }
            }
            return msg;
        });

        // Get total message count for pagination info
        const totalMessages = await Message.countDocuments({ conversation: chatId });

        res.status(200).json({
            success: true,
            data: {
                messages: messages.reverse(), // Reverse to show chronological order (oldest first)
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalMessages / limit),
                    totalMessages,
                    hasNextPage: skip + limit < totalMessages,
                    hasPrevPage: page > 1,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message,
        });
    }
};

/**
 * Mark all messages from a specific sender as read by the current user
 */
export const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        // Validate chat ID
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID',
            });
        }

        // Verify user is a participant
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        const isParticipant = chat.participants.some(
            (p) => p.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this chat',
            });
        }

        // Mark all unread messages from the other user as read
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

        // Reset unread count for this user
        await chat.resetUnreadCount(userId);

        res.status(200).json({
            success: true,
            message: 'Messages marked as read',
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message,
        });
    }
};

/**
 * Archive a chat for the current user
 */
export const archiveChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        // Validate chat ID
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID',
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        const isParticipant = chat.participants.some(
            (p) => p.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this chat',
            });
        }

        // Add user to archivedBy if not already there
        if (!chat.archivedBy.includes(userId)) {
            chat.archivedBy.push(userId);
            await chat.save();
        }

        res.status(200).json({
            success: true,
            message: 'Chat archived successfully',
        });
    } catch (error) {
        console.error('Error archiving chat:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive chat',
            error: error.message,
        });
    }
};

/**
 * Mute/unmute a chat for the current user
 */
export const toggleMuteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        // Validate chat ID
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID',
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        const isParticipant = chat.participants.some(
            (p) => p.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this chat',
            });
        }

        const isMuted = chat.mutedBy.includes(userId);

        if (isMuted) {
            chat.mutedBy = chat.mutedBy.filter((id) => id.toString() !== userId.toString());
        } else {
            chat.mutedBy.push(userId);
        }

        await chat.save();

        res.status(200).json({
            success: true,
            message: `Chat ${isMuted ? 'unmuted' : 'muted'} successfully`,
            isMuted: !isMuted,
        });
    } catch (error) {
        console.error('Error toggling mute:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle mute',
            error: error.message,
        });
    }
};
