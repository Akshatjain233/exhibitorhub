# Updated Data Models - Role-Based Registration

## Model Structure Overview

```
User (Base Model)
├── ArtisanProfile
├── ConsumerProfile
├── TraderProfile
├── SupplierProfile
└── AdminProfile
```

## 1. User Model (Core)

**Purpose**: Base authentication and user management

```javascript
{
  _id: ObjectId,
  name: String (required),
  phone_number: String (required, unique),
  email: String (optional, unique if provided),
  password_hash: String (required),
  
  // ROLE SELECTION (Set during registration)
  role: Enum ['artisan', 'consumer', 'trader', 'supplier', 'admin'] (required),
  
  preferred_language: Enum ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'],
  
  // Verification Status
  is_active: Boolean (default: true),
  is_phone_verified: Boolean (default: false),
  is_email_verified: Boolean (default: false),
  
  // Activity
  last_login: Date,
  login_count: Number (default: 0),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Changes**:
- ✅ Added `name` field (required)
- ✅ Added `email` field (optional)
- ✅ Changed role enum to lowercase: `'artisan'` instead of `'Artisan'`
- ✅ Added `'admin'` role
- ✅ Added verification flags
- ✅ Added `login_count` tracking
- ✅ Standardized language codes to lowercase

---

## 2. ArtisanProfile Model

**Purpose**: Artisan-specific data (craft details, verification, payments)

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  
  // My Story Section
  bio_text: String (max 2000 chars),
  bio_audio_url: String,
  
  // Location (GeoJSON)
  location_gps: {
    type: 'Point',
    coordinates: [Number] // [longitude, latitude]
  },
  location_city: String,
  location_state: String,
  location_region: String, // e.g., "Kutch"
  
  // Craft Information
  craft_tags: [ObjectId] (ref: 'CraftTag'),
  craft_specialization: String, // e.g., "Blue Pottery"
  
  // Verification
  is_verified: Boolean (default: false),
  verification_status: Enum ['pending', 'submitted', 'approved', 'rejected'],
  verification_docs: Object,
  verification_date: Date,
  
  // Ratings
  rating_avg: Number (0-5, default: 0),
  rating_count: Number (default: 0),
  
  // Payment
  payment_upi_id: String,
  payment_account_verified: Boolean (default: false),
  bank_account_number: String,
  bank_ifsc_code: String,
  
  // Analytics
  total_views: Number (default: 0),
  total_likes: Number (default: 0),
  total_shares: Number (default: 0),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Changes**:
- ✅ Improved GeoJSON location structure
- ✅ Added city, state, region fields
- ✅ Added `craft_tags` array
- ✅ Added `verification_status` enum
- ✅ Added `rating_count`
- ✅ Added payment account fields
- ✅ Added analytics counters

---

## 3. ConsumerProfile Model

**Purpose**: Consumer preferences, browsing history, addresses

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  
  // Onboarding
  selected_interests: [String], // ["Home Decor", "Jewelry", ...]
  craft_preferences: [ObjectId] (ref: 'CraftTag'),
  
  // Recommendation Engine
  interest_vector: Object, // ML-based preferences
  
  // Browsing History
  recently_viewed: [{
    content_id: ObjectId (ref: 'Video'),
    viewed_at: Date
  }],
  
  // Interactions
  liked_content: [ObjectId] (ref: 'Video'),
  saved_content: [ObjectId] (ref: 'Video'),
  followed_artisans: [ObjectId] (ref: 'ArtisanProfile'),
  
  // Delivery
  addresses: [{
    label: String,
    full_address: String,
    city: String,
    state: String,
    pincode: String,
    is_default: Boolean
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Changes**:
- ✅ Added `selected_interests` for onboarding
- ✅ Added `craft_preferences` references
- ✅ Improved `recently_viewed` structure with timestamps
- ✅ Added `liked_content`, `saved_content`, `followed_artisans`
- ✅ Added `addresses` array for deliveries

---

## 4. TraderProfile Model ⭐ NEW

**Purpose**: B2B buyers who purchase in bulk

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  
  // Business Information
  company_name: String (required),
  gst_number: String (required),
  trade_license_number: String,
  business_type: Enum ['wholesaler', 'exporter', 'distributor', 'retailer', 'bulk_buyer'],
  
  // Verification
  is_verified: Boolean (default: false),
  verification_docs: {
    gst_certificate: String,
    trade_license: String,
    business_proof: String
  },
  verification_status: Enum ['pending', 'submitted', 'approved', 'rejected'],
  
  // B2B Portal Access
  is_premium_member: Boolean (default: false),
  premium_start_date: Date,
  premium_end_date: Date,
  
  // Lead Management
  free_leads_used: Number (default: 0),
  free_leads_limit: Number (default: 2),
  paid_leads_balance: Number (default: 0),
  total_leads_accessed: Number (default: 0),
  
  // Preferences
  interested_craft_types: [String],
  interested_regions: [String],
  
  // Contact
  contact_person_name: String,
  contact_designation: String,
  business_address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String (default: 'India')
  },
  
  // Metrics
  total_orders_placed: Number (default: 0),
  total_quotes_requested: Number (default: 0),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Features**:
- ✅ Business verification workflow
- ✅ Premium membership for full B2B access
- ✅ Lead management (2 free leads, then paid)
- ✅ Quote request tracking

---

## 5. SupplierProfile Model

**Purpose**: Raw material suppliers for artisans

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  
  // Business Information
  business_name: String (required),
  gst_number: String,
  business_type: Enum ['manufacturer', 'distributor', 'wholesaler', 'raw_material_supplier'],
  
  // Operating Details
  operating_regions: [String],
  material_types: [String], // ["dyes", "yarns", "clay", "metals", ...]
  
  // Verification
  is_verified: Boolean (default: false),
  verification_docs: Object,
  
  // Premium Subscription
  is_premium: Boolean (default: false),
  premium_start_date: Date,
  premium_end_date: Date,
  
  // Lead Management
  lead_credits_balance: Number (default: 2), // 2 free leads
  total_leads_accessed: Number (default: 0),
  
  // Contact
  contact_person: String,
  contact_phone: String,
  contact_email: String,
  business_address: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Changes**:
- ✅ Added `business_name` (required)
- ✅ Added `business_type` enum
- ✅ Added `operating_regions` and `material_types`
- ✅ Added premium subscription dates
- ✅ Changed default lead credits to 2
- ✅ Added contact fields

---

## 6. AdminProfile Model ⭐ NEW

**Purpose**: Platform administrators and moderators

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  
  // Admin Details
  employee_id: String (unique),
  department: Enum ['operations', 'moderation', 'support', 'tech', 'management'],
  
  // Permissions
  access_level: Enum ['super_admin', 'moderator', 'support', 'analyst'],
  permissions: [String], // ['verify_artisans', 'moderate_content', ...]
  
  // Activity Tracking
  total_verifications: Number (default: 0),
  total_moderations: Number (default: 0),
  last_action_at: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Registration Flow

### Step 1: User selects role during registration

```
┌─────────────────────────────────────┐
│  Select Your Role                   │
│                                     │
│  ○ Artisan    (Craft creator)      │
│  ○ Consumer   (Buyer)              │
│  ○ Trader     (Bulk buyer)         │
│  ○ Supplier   (Material supplier)  │
│                                     │
└─────────────────────────────────────┘
```

### Step 2: System creates User + Profile

```javascript
// 1. Create User record
const user = await User.create({
  name: "Ramesh Kumar",
  phone_number: "+919876543210",
  role: "artisan", // ← Role selected by user
  preferred_language: "hi",
  password_hash: hashedPassword
});

// 2. Auto-create corresponding profile
const artisanProfile = await ArtisanProfile.create({
  user: user._id,
  verification_status: "pending"
});
```

### Step 3: Role-specific onboarding

```
artisan    → Add craft tags, bio, location, payment info
consumer   → Select interests, add address
trader     → Add company details, GST, interested craft types
supplier   → Add business info, inventory, operating regions
admin      → Set by super admin (not self-registration)
```

---

## Database Indexes

All models now have performance indexes:

### User
- `phone_number` (unique)
- `email` (unique, sparse)
- `role`
- `is_active`

### ArtisanProfile
- `user` (unique)
- `is_verified`
- `location_city`, `location_state`
- `craft_tags`
- `rating_avg` (descending)
- `verification_status`
- `location_gps` (2dsphere for geo queries)

### ConsumerProfile
- `user` (unique)
- `craft_preferences`
- `followed_artisans`

### TraderProfile
- `user` (unique)
- `company_name` (text index)
- `is_verified`
- `is_premium_member`

### SupplierProfile
- `user` (unique)
- `is_verified`
- `is_premium`
- `material_types`
- `operating_regions`
- `business_name` (text index)

---

## Key Improvements Summary

✅ **Role-based registration**: User selects role upfront  
✅ **Five distinct roles**: artisan, consumer, trader, supplier, admin  
✅ **One-to-one relationship**: One User → One Profile  
✅ **Enhanced verification**: Status tracking for all business roles  
✅ **Premium memberships**: For traders and suppliers  
✅ **Lead management**: Free + paid leads for B2B users  
✅ **Better location data**: GeoJSON for artisans  
✅ **Performance indexes**: Optimized for common queries  
✅ **Language standardization**: Lowercase codes  
✅ **Analytics tracking**: Views, likes, shares for artisans  

---

## Usage Example

```javascript
import { User, ArtisanProfile, ConsumerProfile } from './models/index.js';

// Register artisan
const user = await User.create({
  name: "Priya Sharma",
  phone_number: "+919123456789",
  role: "artisan",
  preferred_language: "hi",
  password_hash: await bcrypt.hash(password, 10)
});

const profile = await ArtisanProfile.create({
  user: user._id,
  location_city: "Jaipur",
  location_state: "Rajasthan",
  craft_specialization: "Blue Pottery"
});

// Query user with profile
const fullUser = await User.findById(userId)
  .populate({
    path: 'profile',
    model: 'ArtisanProfile'
  });
```
