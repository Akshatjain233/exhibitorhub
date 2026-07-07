import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    
    // Admin Details
    employee_id: {
        type: String,
        unique: true,
    },
    department: {
        type: String,
        enum: ['operations', 'moderation', 'support', 'tech', 'management'],
    },
    
    // Permissions & Access Level
    access_level: {
        type: String,
        enum: ['super_admin', 'moderator', 'support', 'analyst'],
        default: 'support',
    },
    permissions: [{
        type: String, // e.g., 'verify_artisans', 'moderate_content', 'manage_users', 'view_analytics'
    }],
    
    // Activity Tracking
    total_verifications: {
        type: Number,
        default: 0,
    },
    total_moderations: {
        type: Number,
        default: 0,
    },
    last_action_at: {
        type: Date,
    },
}, { timestamps: true });

const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema);
export default AdminProfile;
