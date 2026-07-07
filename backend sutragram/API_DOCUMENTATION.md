# API Documentation - Artisan Showcase Platform

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Routes (`/api/auth`)

### Register User
**POST** `/auth/register`

Register a new user (artisan, consumer, trader, supplier, or admin)

**⚠️ Email is required and will receive OTP for verification**

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+919876543210",
  "password": "password123",
  "role": "artisan",
  "preferred_language": "en",
  
  // For artisan
  "location_city": "Jaipur",
  "location_state": "Rajasthan",
  "location_region": "Rajasthan",
  "craft_specialization": "Blue Pottery",
  
  // For consumer
  "selected_interests": ["Pottery", "Textiles"],
  
  // For trader
  "company_name": "ABC Traders",
  "gst_number": "27AABCU9603R1ZM",
  
  // For supplier
  "business_name": "XYZ Suppliers"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your email.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "artisan",
      "is_email_verified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/auth/login`

**⚠️ Login using email address**

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "artisan",
      "is_email_verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Verify OTP
**POST** `/auth/verify-otp`

**✉️ Verify OTP sent to email**

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "is_email_verified": true
    }
  }
}
```

**Note:** A welcome email will be sent automatically after successful verification.

### Resend OTP
**POST** `/auth/resend-otp`

**✉️ Request new OTP via email**

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully."
}
```

### Update Language
**PUT** `/auth/language` 🔒

**Body:**
```json
{
  "preferred_language": "hi"
}
```

### Refresh Token
**POST** `/auth/refresh-token` 🔒

### Logout
**POST** `/auth/logout` 🔒

---

## User Routes (`/api/user`)

### Get Profile
**GET** `/user/profile` 🔒

Returns current user's profile with role-specific data

### Update Profile
**PUT** `/user/profile` 🔒

**Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "preferred_language": "hi"
}
```

### Change Password
**PUT** `/user/change-password` 🔒

**Body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass123"
}
```

### Update Settings
**PUT** `/user/settings` 🔒

**Body:**
```json
{
  "preferred_language": "ta"
}
```

### Deactivate Account
**PUT** `/user/deactivate` 🔒

### Request Data Deletion
**POST** `/user/request-deletion` 🔒

### Delete Account
**DELETE** `/user/account` 🔒

**Body:**
```json
{
  "password": "password123"
}
```

### Get Public Profile
**GET** `/user/:userId/public-profile`

---

## Artisan Routes (`/api/artisan`)

### Get Artisan Profile
**GET** `/artisan/profile` 🔒 (artisan only)

### Update Artisan Profile
**PUT** `/artisan/profile` 🔒 (artisan only)

**Body:**
```json
{
  "bio_text": "I am a traditional Blue Pottery artisan...",
  "location_city": "Jaipur",
  "location_state": "Rajasthan",
  "location_region": "Rajasthan",
  "craft_specialization": "Blue Pottery",
  "location_gps": {
    "longitude": 75.7873,
    "latitude": 26.9124
  }
}
```

### Update Bio
**PUT** `/artisan/bio` 🔒 (artisan only)

**Body:**
```json
{
  "bio_text": "My story...",
  "bio_audio_url": "https://cloudinary.com/audio.mp3"
}
```

### Update Craft Tags
**PUT** `/artisan/craft-tags` 🔒 (artisan only)

**Body:**
```json
{
  "craft_tags": ["tag_id_1", "tag_id_2", "tag_id_3"]
}
```

### Link Payment Account
**PUT** `/artisan/payment-account` 🔒 (artisan only)

**Body:**
```json
{
  "payment_upi_id": "artisan@upi",
  "bank_account_number": "1234567890",
  "bank_ifsc_code": "SBIN0001234"
}
```

### Get Verification Status
**GET** `/artisan/verification-status` 🔒 (artisan only)

### Submit for Verification
**POST** `/artisan/submit-verification` 🔒 (artisan only)

**Body:**
```json
{
  "verification_docs": {
    "aadhar": "url_to_aadhar",
    "craft_certificate": "url_to_certificate"
  }
}
```

### Get Analytics
**GET** `/artisan/analytics` 🔒 (artisan only)

### Search Artisans
**GET** `/artisan/search`

**Query Parameters:**
- `craft_tags`: comma-separated tag IDs
- `location_city`: city name
- `location_state`: state name
- `is_verified`: true/false
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

Example: `/artisan/search?location_city=Jaipur&is_verified=true&page=1&limit=10`

### Get Public Artisan Profile
**GET** `/artisan/:artisanId`

---

## Consumer Routes (`/api/consumer`)

All consumer routes require authentication and consumer role 🔒

### Get Consumer Profile
**GET** `/consumer/profile`

### Update Consumer Profile
**PUT** `/consumer/profile`

**Body:**
```json
{
  "selected_interests": ["Pottery", "Textiles", "Jewelry"]
}
```

### Update Craft Preferences
**PUT** `/consumer/preferences`

**Body:**
```json
{
  "craft_preferences": ["tag_id_1", "tag_id_2"]
}
```

### Update Interests
**PUT** `/consumer/interests`

**Body:**
```json
{
  "selected_interests": ["Home Decor", "Handloom", "Jewelry"]
}
```

### Follow Artisan
**POST** `/consumer/follow/:artisanId`

### Unfollow Artisan
**DELETE** `/consumer/follow/:artisanId`

### Get Followed Artisans
**GET** `/consumer/following`

### Get Addresses
**GET** `/consumer/addresses`

### Add Address
**POST** `/consumer/address`

**Body:**
```json
{
  "label": "Home",
  "full_address": "123 Main Street, Block A",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "is_default": true
}
```

### Update Address
**PUT** `/consumer/address/:addressId`

**Body:**
```json
{
  "label": "Office",
  "full_address": "456 Business Park",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400002",
  "is_default": false
}
```

### Delete Address
**DELETE** `/consumer/address/:addressId`

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Language Codes

Supported languages for `preferred_language`:
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

---

## Email Verification System

### Registration & Verification Flow

1. **User registers** with email, name, password, and role
2. **OTP generated** (6-digit code, valid for 10 minutes)
3. **OTP sent to email** via Brevo with professional HTML template
4. **User verifies email** by submitting OTP
5. **Welcome email sent** automatically after verification
6. **User can login** using verified email

### Email Templates

**OTP Verification Email:**
- Professional gradient header with platform branding
- Large, easy-to-read 6-digit OTP code
- 10-minute expiration notice
- Security tips and warnings
- Responsive HTML design

**Welcome Email:**
- Role-specific welcome message
- Platform overview and next steps
- Professional styling

### Email Service Configuration

- **Provider**: Brevo (formerly Sendinblue)
- **Sender**: Artisan Showcase Platform <no-reply@sutragram.com>
- **Delivery**: Production-ready SMTP service
- **OTP Expiry**: 10 minutes
- **OTP Format**: 6-digit numeric code (100000-999999)

---

## Notes

1. 🔒 indicates protected routes requiring authentication
2. Some routes have additional role-based access control
3. **OTP is sent via email** using Brevo - check your inbox (and spam folder)
4. JWT tokens expire in 7 days by default
5. All timestamps are in ISO 8601 format
6. Maximum 5 craft tags per artisan profile
7. Consumers must select at least 3 interests during onboarding
8. **Email is required** for registration and login
9. Phone number is optional
10. Email must be verified before full platform access
