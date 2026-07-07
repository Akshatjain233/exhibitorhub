import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import ArtisanProfile from '../../models/ArtisanProfile.js';
import ConsumerProfile from '../../models/ConsumerProfile.js';
import TraderProfile from '../../models/TraderProfile.js';
import bcrypt from 'bcryptjs';

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret-key', {
        expiresIn: '30d',
    });
};

// Create test user with specific role
export const createTestUser = async (role = 'consumer', userData = {}) => {
    const defaultPassword = 'Test@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const normalizedRole = role;

    const user = await User.create({
        name: userData.name || `Test ${role}`,
        email: userData.email || `test${role}@example.com`,
        phone_number: userData.phone_number || `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password_hash: hashedPassword,
        role: normalizedRole,
        preferred_language: userData.preferred_language || 'en',
        is_active: true,
        ...userData,
    });

    // Create role-specific profile
    let profile = null;
    switch (normalizedRole) {
        case 'artisan':
            profile = await ArtisanProfile.create({
                user: user._id,
                bio_text: 'Test artisan bio',
                craft_specialization: 'Pottery',
                location_city: 'Delhi',
                location_state: 'Delhi',
                location_region: 'North',
            });
            break;
        case 'consumer':
            profile = await ConsumerProfile.create({
                user: user._id,
            });
            break;
        case 'trader':
            profile = await TraderProfile.create({
                user: user._id,
                company_name: 'Test Trading Co',
                gst_number: '22AAAAA0000A1Z5',
                business_type: 'exporter',
                can_supply_materials: true,
            });
            break;
    }

    return { user, profile, password: defaultPassword };
};

// Create authenticated request headers
export const authHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
});
