import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone_number: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password_hash: {
        type: String,
        required: true,
    },
    profile_picture: {
        type: String,
        default: '',
    },
    profile_image_url: {
        type: String,
        default: null,
    },
    cover_image_url: {
        type: String,
        default: null,
    },

    // Role Selection (set during registration)
    role: {
        type: String,
        enum: ['artisan', 'consumer', 'trader', 'supplier', 'admin'],
        required: true,
    },

    // Language Preference
    preferred_language: {
        type: String,
        enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'], // English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi
        default: 'en',
    },

    // Account Status
    is_active: {
        type: Boolean,
        default: true,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    is_phone_verified: {
        type: Boolean,
        default: false,
    },
    is_email_verified: {
        type: Boolean,
        default: false,
    },

    // Privacy Settings for Chat
    isOnlinePresencePublic: {
        type: Boolean,
        default: true,
    },

    // Activity Tracking
    last_login: {
        type: Date,
    },
    login_count: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Indexes for performance
userSchema.index({ phone_number: 1 });
// Note: email has unique:true which already creates an index — no need for schema.index({ email: 1 })
userSchema.index({ role: 1 });
userSchema.index({ is_active: 1 });

// Virtual for profile based on role
userSchema.virtual('profile', {
    ref: function () {
        switch (this.role) {
            case 'artisan': return 'ArtisanProfile';
            case 'consumer': return 'ConsumerProfile';
            case 'trader': return 'TraderProfile';
            case 'supplier': return 'SupplierProfile';
            case 'admin': return 'AdminProfile';
            default: return null;
        }
    },
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

// Method to increment login count
userSchema.methods.recordLogin = function () {
    return this.model('User').updateOne(
        { _id: this._id },
        { 
            $set: { last_login: new Date() },
            $inc: { login_count: 1 }
        }
    );
};

// Method to check if profile exists
userSchema.methods.hasProfile = async function () {
    const modelName = this.getProfileModelName();
    if (!modelName) return false;

    const ProfileModel = mongoose.model(modelName);
    const profile = await ProfileModel.findOne({ user: this._id });
    return !!profile;
};

// Helper method to get profile model name
userSchema.methods.getProfileModelName = function () {
    switch (this.role) {
        case 'artisan': return 'ArtisanProfile';
        case 'consumer': return 'ConsumerProfile';
        case 'trader': return 'TraderProfile';
        case 'supplier': return 'SupplierProfile';
        case 'admin': return 'AdminProfile';
        default: return null;
    }
};

const User = mongoose.model('User', userSchema);
export default User;