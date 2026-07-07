const mongoose = require('mongoose');
const User = require('../models/User');
const Exhibitor = require('../models/Exhibitor');
const Product = require('../models/Product');
const Session = require('../models/Session');

class AdminService {
    getHealthSnapshot() {
        const dbStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        const databaseState = dbStates[mongoose.connection.readyState] || 'unknown';
        return {
            status: databaseState === 'connected' ? 'healthy' : 'degraded',
            timestamp: new Date(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            node_version: process.version,
            database: databaseState,
        };
    }

    async getDashboardStats() {
        const totalUsers = await User.countDocuments();
        const exhibitorCount = await User.countDocuments({ role: 'exhibitor' });
        const visitorCount = await User.countDocuments({ role: 'visitor' });

        const totalExhibitors = await Exhibitor.countDocuments();
        const pendingExhibitors = await Exhibitor.countDocuments({ verified: false });
        
        const totalProducts = await Product.countDocuments();
        const totalSessions = await Session.countDocuments();

        return {
            users: { total: totalUsers, exhibitors: exhibitorCount, visitors: visitorCount },
            exhibitors: { total: totalExhibitors, pending: pendingExhibitors },
            products: { total: totalProducts },
            sessions: { total: totalSessions }
        };
    }

    async getAllUsers(queryData) {
        const { role, is_active, page = 1, limit = 20 } = queryData;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = {};
        if (role) query.role = role;
        if (is_active !== undefined) query.is_active = is_active === 'true';

        const users = await User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
        const total = await User.countDocuments(query);
        return {
            users,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        };
    }

    async toggleUserActive(userId) {
        const user = await User.findById(userId);
        if (!user) return null;
        user.is_active = user.is_active === false ? true : false;
        await user.save();
        return user;
    }

    async getPendingVerifications(page = 1, limit = 20) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const exhibitors = await Exhibitor.find({ verified: false }).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
        const total = await Exhibitor.countDocuments({ verified: false });
        return {
            exhibitors,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        };
    }

    async verifyExhibitor(id) {
        const exhibitor = await Exhibitor.findById(id);
        if (!exhibitor) return null;
        exhibitor.verified = true;
        await exhibitor.save();
        return exhibitor;
    }

    async verifyProduct(id) {
        // Assuming products might need verification later, for now just returning it
        const product = await Product.findById(id);
        if (!product) return null;
        // product.is_verified = true;
        await product.save();
        return product;
    }
}

module.exports = new AdminService();
