# Role-Based User Registration Flow

## Overview

The Artisan Showcase Platform uses a **role-based registration system** where users select their role during the registration process. Based on the selected role, the system creates both a base `User` account and a corresponding role-specific profile.

## User Roles

The platform supports five distinct user roles:

1. **artisan** - Craftspeople who create and sell handmade products
2. **consumer** - End-users who browse and purchase artisan products
3. **trader** - B2B buyers who purchase products in bulk
4. **supplier** - Raw material suppliers who provide materials to artisans
5. **admin** - Platform administrators and moderators

## Registration Flow

### Step 1: Role Selection
During registration, users must select their role from the available options.

### Step 2: Basic Information
All users provide:
- Name
- Phone number (required, unique)
- Email (optional)
- Password
- Preferred language

### Step 3: User Account Creation
A `User` record is created with:
```javascript
{
  name: "User Name",
  phone_number: "+919876543210",
  email: "user@example.com", // optional
  password_hash: "hashed_password",
  role: "artisan", // selected role
  preferred_language: "hi", // Hindi
  is_phone_verified: false,
  is_active: true
}
```

### Step 4: Profile Creation
Based on the role, a corresponding profile is automatically created:

#### For Artisan (ArtisanProfile)
```javascript
{
  user: ObjectId("user_id"),
  bio_text: null, // To be filled during onboarding
  craft_tags: [],
  location_city: null,
  is_verified: false,
  verification_status: "pending",
  payment_upi_id: null
}
```

#### For Consumer (ConsumerProfile)
```javascript
{
  user: ObjectId("user_id"),
  selected_interests: [], // To be selected during onboarding
  craft_preferences: [],
  recently_viewed: [],
  addresses: []
}
```

#### For Trader (TraderProfile)
```javascript
{
  user: ObjectId("user_id"),
  company_name: null, // To be filled
  gst_number: null,
  is_verified: false,
  is_premium_member: false,
  free_leads_used: 0,
  free_leads_limit: 2
}
```

#### For Supplier (SupplierProfile)
```javascript
{
  user: ObjectId("user_id"),
  business_name: null, // To be filled
  gst_number: null,
  is_verified: false,
  is_premium: false,
  lead_credits_balance: 2 // 2 free leads
}
```

#### For Admin (AdminProfile)
```javascript
{
  user: ObjectId("user_id"),
  employee_id: null,
  access_level: "support",
  permissions: []
}
```

## Database Schema

### User Model (Base)
- Primary authentication and identification
- Stores role selection
- Common fields across all user types

### Profile Models (Role-Specific)
- **ArtisanProfile**: Craft details, verification, location, payment info
- **ConsumerProfile**: Preferences, browsing history, addresses
- **TraderProfile**: Business details, B2B access, lead management
- **SupplierProfile**: Inventory management, premium subscription
- **AdminProfile**: Access levels, permissions, admin activities

## API Endpoints for Registration

### POST /api/auth/register
Request body:
```json
{
  "name": "Ramesh Kumar",
  "phone_number": "+919876543210",
  "email": "ramesh@example.com",
  "password": "SecurePass123",
  "role": "artisan",
  "preferred_language": "hi"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "role": "artisan",
    "phone_verified": false,
    "profile_created": true
  }
}
```

## Role-Specific Onboarding

After registration, users go through role-specific onboarding:

### Artisan Onboarding
1. Add craft type and specialization (up to 5 tags)
2. Write "My Story" bio
3. Add location details
4. Upload verification documents
5. Link payment account (UPI/Bank)

### Consumer Onboarding
1. Select at least 3 craft interests
2. Add delivery address (optional)
3. Set content preferences

### Trader Onboarding
1. Add company details
2. Upload GST certificate and trade license
3. Specify interested craft types and regions
4. Choose premium membership (optional)

### Supplier Onboarding
1. Add business information
2. Upload inventory items
3. Specify operating regions and material types
4. Choose premium subscription (optional)

## Language Support

Supported languages (ISO 639-1 codes):
- `en` - English
- `hi` - Hindi
- `ta` - Tamil
- `te` - Telugu
- `bn` - Bengali
- `mr` - Marathi
- `gu` - Gujarati
- `kn` - Kannada
- `ml` - Malayalam
- `pa` - Punjabi

All UI elements, onboarding screens, and messages are rendered in the selected language.

## Profile Verification

### Artisan Verification
- Status: pending → submitted → approved/rejected
- Requires: ID proof, craft authenticity documents
- Benefits: Verified badge, higher visibility, full platform access

### Trader/Supplier Verification
- Status: pending → submitted → approved/rejected
- Requires: GST certificate, business registration, trade license
- Benefits: Access to B2B portal, lead generation features

## User Methods

The User model includes helper methods:

```javascript
// Record user login
await user.recordLogin();

// Check if user has profile created
const hasProfile = await user.hasProfile();

// Get profile model name based on role
const modelName = user.getProfileModelName(); // Returns 'ArtisanProfile', etc.
```

## Querying Users by Role

```javascript
// Find all artisans
const artisans = await User.find({ role: 'artisan' });

// Find a user with their profile
const user = await User.findById(userId).populate({
  path: 'profile',
  model: user.getProfileModelName()
});
```

## Security Considerations

1. **Phone verification required**: Users must verify phone via OTP before full access
2. **Role immutability**: Users cannot change their role after registration
3. **Profile privacy**: Role-specific sensitive data (payment info, GST numbers) is stored in profile models
4. **Password hashing**: All passwords are hashed using bcrypt before storage

## Notes

- A user can only have ONE role
- Each user can have only ONE profile (one-to-one relationship)
- Role is selected during registration and cannot be changed
- Profile completion is enforced through onboarding flows
- Verification is required for artisans, traders, and suppliers to access full features
