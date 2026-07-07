# Postman API Testing Guide - Artisan Showcase Platform

## Table of Contents
1. [Setup](#setup)
2. [Environment Variables](#environment-variables)
3. [Authentication Flow](#authentication-flow)
4. [API Examples](#api-examples)

---

## Setup

### 1. Install Postman
Download and install Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

### 2. Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Artisan Showcase Platform API"

---

## Environment Variables

Create environment variables for easier testing:

1. Click on "Environments" in Postman
2. Create new environment "Artisan Platform Local"
3. Add these variables:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3001/api` |
| `token` | (leave empty - will be set after login) |
| `artisan_id` | (leave empty) |
| `consumer_id` | (leave empty) |

---

## Authentication Flow

### Step 1: Register as Artisan

**Request:**
```
POST {{base_url}}/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone_number": "+919876543210",
  "password": "SecurePass123",
  "role": "artisan",
  "preferred_language": "hi",
  "location_city": "Jaipur",
  "location_state": "Rajasthan",
  "location_region": "Rajasthan",
  "craft_specialization": "Blue Pottery",
  "craft_tags": []
}
```

**Optional: Add GPS coordinates**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone_number": "+919876543210",
  "password": "SecurePass123",
  "role": "artisan",
  "preferred_language": "hi",
  "location_city": "Jaipur",
  "location_state": "Rajasthan",
  "location_region": "Rajasthan",
  "craft_specialization": "Blue Pottery",
  "craft_tags": [],
  "location_gps": {
    "coordinates": [75.7873, 26.9124]
  }
}
```

**Note:** `location_gps` is optional. Only include it if you have GPS coordinates available. The coordinates array format is `[longitude, latitude]`.

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your email.",
  "data": {
    "user": {
      "id": "65f1234567890abcdef12345",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "artisan",
      "preferred_language": "hi",
      "is_email_verified": false
    },
    "profile": {
      "_id": "65f1234567890abcdef12346",
      "user": "65f1234567890abcdef12345",
      "location_city": "Jaipur",
      "location_state": "Rajasthan",
      "craft_specialization": "Blue Pottery"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Post-response Script (to save token):**
```javascript
var jsonData = pm.response.json();
if (jsonData.success && jsonData.data.token) {
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("artisan_id", jsonData.data.profile._id);
}
```

---

### Step 2: Verify OTP

**Request:**
```
POST {{base_url}}/auth/verify-otp
```

**Body (JSON):**
```json
{
  "email": "rajesh@example.com",
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "user": {
      "id": "65f1234567890abcdef12345",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "is_email_verified": true
    }
  }
}
```

**Note:** Check your email inbox for the OTP. In production, OTP will be sent via Brevo email service.

---

### Step 3: Login

**Request:**
```
POST {{base_url}}/auth/login
```

**Body (JSON):**
```json
{
  "email": "rajesh@example.com",
  "password": "SecurePass123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "65f1234567890abcdef12345",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "phone_number": "+919876543210",
      "role": "artisan",
      "preferred_language": "hi",
      "is_email_verified": true,
      "last_login": "2026-02-13T09:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Post-response Script:**
```javascript
var jsonData = pm.response.json();
if (jsonData.success && jsonData.data.token) {
    pm.environment.set("token", jsonData.data.token);
}
```

---

## API Examples

### 🔐 Authentication Required

For all protected routes, add this header:

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 1️⃣ User Profile Management

### Get Current User Profile

**Request:**
```
GET {{base_url}}/user/profile
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "phone_number": "+919876543210",
      "role": "artisan",
      "preferred_language": "hi",
      "is_active": true,
      "is_email_verified": true
    },
    "profile": {
      "_id": "65f1234567890abcdef12346",
      "user": "65f1234567890abcdef12345",
      "bio_text": null,
      "location_city": "Jaipur",
      "location_state": "Rajasthan",
      "craft_specialization": "Blue Pottery",
      "is_verified": false,
      "verification_status": "pending"
    }
  }
}
```

---

### Update Basic Profile

**Request:**
```
PUT {{base_url}}/user/profile
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Rajesh Kumar Sharma",
  "email": "rajesh.sharma@example.com",
  "preferred_language": "en"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "Rajesh Kumar Sharma",
      "email": "rajesh.sharma@example.com",
      "preferred_language": "en"
    }
  }
}
```

---

### Change Password

**Request:**
```
PUT {{base_url}}/user/change-password
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "current_password": "SecurePass123",
  "new_password": "NewSecurePass456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

## 2️⃣ Artisan Profile Management

### Update Artisan Profile

**Request:**
```
PUT {{base_url}}/artisan/profile
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "bio_text": "I am a 3rd generation Blue Pottery artisan from Jaipur. My family has been practicing this traditional craft for over 75 years. Each piece is handcrafted with natural materials and traditional techniques.",
  "location_city": "Jaipur",
  "location_state": "Rajasthan",
  "location_region": "Rajasthan",
  "craft_specialization": "Blue Pottery and Traditional Ceramics",
  "location_gps": {
    "longitude": 75.7873,
    "latitude": 26.9124
  }
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Artisan profile updated successfully.",
  "data": {
    "profile": {
      "_id": "65f1234567890abcdef12346",
      "user": "65f1234567890abcdef12345",
      "bio_text": "I am a 3rd generation Blue Pottery artisan...",
      "location_city": "Jaipur",
      "location_state": "Rajasthan",
      "craft_specialization": "Blue Pottery and Traditional Ceramics",
      "location_gps": {
        "type": "Point",
        "coordinates": [75.7873, 26.9124]
      }
    }
  }
}
```

---

### Update Bio Story

**Request:**
```
PUT {{base_url}}/artisan/bio
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "bio_text": "My journey with Blue Pottery started when I was just 8 years old, learning from my grandfather. Every piece tells a story of our heritage.",
  "bio_audio_url": "https://res.cloudinary.com/demo/audio/bio_rajesh.mp3"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Bio updated successfully.",
  "data": {
    "bio_text": "My journey with Blue Pottery started...",
    "bio_audio_url": "https://res.cloudinary.com/demo/audio/bio_rajesh.mp3"
  }
}
```

---

### Link Payment Account

**Request:**
```
PUT {{base_url}}/artisan/payment-account
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "payment_upi_id": "rajesh.potter@paytm",
  "bank_account_number": "123456789012",
  "bank_ifsc_code": "SBIN0001234"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment account linked successfully.",
  "data": {
    "payment_upi_id": "rajesh.potter@paytm",
    "bank_account_number": "****9012",
    "bank_ifsc_code": "SBIN0001234",
    "payment_account_verified": true
  }
}
```

---

### Submit for Verification

**Request:**
```
POST {{base_url}}/artisan/submit-verification
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "verification_docs": {
    "aadhar_card": "https://cloudinary.com/docs/aadhar_front.jpg",
    "craft_certificate": "https://cloudinary.com/docs/craft_cert.pdf",
    "workshop_photo": "https://cloudinary.com/docs/workshop.jpg"
  }
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Verification documents submitted successfully. You will be notified once reviewed.",
  "data": {
    "verification_status": "submitted"
  }
}
```

---

### Get Verification Status

**Request:**
```
GET {{base_url}}/artisan/verification-status
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "is_verified": false,
    "verification_status": "submitted",
    "verification_date": null
  }
}
```

---

### Get Artisan Analytics

**Request:**
```
GET {{base_url}}/artisan/analytics
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "total_views": 1250,
    "total_likes": 485,
    "total_shares": 127,
    "rating_avg": 4.7,
    "rating_count": 89
  }
}
```

---

### Search Artisans (Public)

**Request:**
```
GET {{base_url}}/artisan/search?location_city=Jaipur&is_verified=true&page=1&limit=10
```

**No authentication required**

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "artisans": [
      {
        "_id": "65f1234567890abcdef12346",
        "user": {
          "_id": "65f1234567890abcdef12345",
          "name": "Rajesh Kumar",
          "is_active": true
        },
        "bio_text": "I am a 3rd generation Blue Pottery artisan...",
        "location_city": "Jaipur",
        "location_state": "Rajasthan",
        "craft_specialization": "Blue Pottery",
        "is_verified": true,
        "rating_avg": 4.7,
        "total_views": 1250
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

### Get Public Artisan Profile

**Request:**
```
GET {{base_url}}/artisan/65f1234567890abcdef12346
```

**No authentication required**

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65f1234567890abcdef12346",
    "name": "Rajesh Kumar",
    "bio_text": "I am a 3rd generation Blue Pottery artisan...",
    "location_city": "Jaipur",
    "location_state": "Rajasthan",
    "craft_specialization": "Blue Pottery",
    "is_verified": true,
    "rating_avg": 4.7,
    "rating_count": 89,
    "total_views": 1250,
    "total_likes": 485
  }
}
```

---

## 3️⃣ Consumer Registration & Profile

### Register as Consumer

**Request:**
```
POST {{base_url}}/auth/register
```

**Body (JSON):**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone_number": "+919876543211",
  "password": "ConsumerPass123",
  "role": "consumer",
  "preferred_language": "en",
  "selected_interests": ["Pottery", "Textiles", "Jewelry", "Home Decor"]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your email.",
  "data": {
    "user": {
      "id": "65f1234567890abcdef12347",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "role": "consumer",
      "preferred_language": "en",
      "is_email_verified": false
    },
    "profile": {
      "_id": "65f1234567890abcdef12348",
      "user": "65f1234567890abcdef12347",
      "selected_interests": ["Pottery", "Textiles", "Jewelry", "Home Decor"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Update Consumer Preferences

**Request:**
```
PUT {{base_url}}/consumer/preferences
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "craft_preferences": ["65f1234567890abcdef00001", "65f1234567890abcdef00002"]
}
```

**Note:** Use actual CraftTag IDs from your database

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Craft preferences updated successfully.",
  "data": {
    "craft_preferences": [
      {
        "_id": "65f1234567890abcdef00001",
        "name_english": "Blue Pottery",
        "type": "Technique"
      },
      {
        "_id": "65f1234567890abcdef00002",
        "name_english": "Handloom",
        "type": "Technique"
      }
    ]
  }
}
```

---

### Update Interests

**Request:**
```
PUT {{base_url}}/consumer/interests
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "selected_interests": ["Pottery", "Metalwork", "Woodcraft", "Traditional Art"]
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Interests updated successfully.",
  "data": {
    "selected_interests": ["Pottery", "Metalwork", "Woodcraft", "Traditional Art"]
  }
}
```

---

### Follow an Artisan

**Request:**
```
POST {{base_url}}/consumer/follow/65f1234567890abcdef12346
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Artisan followed successfully.",
  "data": {
    "followed_artisans": ["65f1234567890abcdef12346"]
  }
}
```

---

### Unfollow an Artisan

**Request:**
```
DELETE {{base_url}}/consumer/follow/65f1234567890abcdef12346
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Artisan unfollowed successfully.",
  "data": {
    "followed_artisans": []
  }
}
```

---

### Get Followed Artisans

**Request:**
```
GET {{base_url}}/consumer/following
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "followed_artisans": [
      {
        "_id": "65f1234567890abcdef12346",
        "user": {
          "_id": "65f1234567890abcdef12345",
          "name": "Rajesh Kumar"
        },
        "bio_text": "I am a 3rd generation Blue Pottery artisan...",
        "location_city": "Jaipur",
        "craft_specialization": "Blue Pottery",
        "is_verified": true
      }
    ]
  }
}
```

---

## 4️⃣ Address Management

### Add Address

**Request:**
```
POST {{base_url}}/consumer/address
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "label": "Home",
  "full_address": "123, Green Park Society, Vastrapur",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380015",
  "is_default": true
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Address added successfully.",
  "data": {
    "addresses": [
      {
        "_id": "65f1234567890abcdef12400",
        "label": "Home",
        "full_address": "123, Green Park Society, Vastrapur",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pincode": "380015",
        "is_default": true
      }
    ]
  }
}
```

---

### Get All Addresses

**Request:**
```
GET {{base_url}}/consumer/addresses
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "_id": "65f1234567890abcdef12400",
        "label": "Home",
        "full_address": "123, Green Park Society, Vastrapur",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pincode": "380015",
        "is_default": true
      },
      {
        "_id": "65f1234567890abcdef12401",
        "label": "Office",
        "full_address": "456, Business Hub, SG Highway",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pincode": "380054",
        "is_default": false
      }
    ]
  }
}
```

---

### Update Address

**Request:**
```
PUT {{base_url}}/consumer/address/65f1234567890abcdef12400
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "label": "Home Address",
  "full_address": "123, Green Park Society, Near City Mall, Vastrapur",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380015",
  "is_default": true
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Address updated successfully.",
  "data": {
    "addresses": [...]
  }
}
```

---

### Delete Address

**Request:**
```
DELETE {{base_url}}/consumer/address/65f1234567890abcdef12400
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Address deleted successfully.",
  "data": {
    "addresses": []
  }
}
```

---

## 5️⃣ Testing Error Scenarios

### Unauthorized Access (No Token)

**Request:**
```
GET {{base_url}}/user/profile
```

**Headers:**
```
Content-Type: application/json
```

**(Don't include Authorization header)**

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

### Invalid Credentials

**Request:**
```
POST {{base_url}}/auth/login
```

**Body (JSON):**
```json
{
  "phone_number": "+919876543210",
  "password": "WrongPassword"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

---

### Role-Based Access Control

**Request:**
```
GET {{base_url}}/artisan/profile
```

**Headers:**
```
Authorization: Bearer {{consumer_token}}
```

**(Try accessing artisan route with consumer token)**

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Access denied. Required role: artisan"
}
```

---

## 📋 Postman Collection Import

You can create a Postman collection with all these requests. Here's a quick setup:

1. **Create Collection**: "Artisan Platform API"
2. **Set Authorization**: 
   - Go to Collection settings
   - Authorization tab
   - Type: Bearer Token
   - Token: `{{token}}`
3. **Add Folders**:
   - Auth
   - User
   - Artisan
   - Consumer
4. **Add all requests above to respective folders**

---

## 🔄 Common Postman Scripts

### Set Token After Login (Tests tab)
```javascript
var jsonData = pm.response.json();
if (jsonData.success && jsonData.data.token) {
    pm.environment.set("token", jsonData.data.token);
    console.log("Token saved successfully");
}
```

### Log Response Time (Tests tab)
```javascript
console.log("Response time: " + pm.response.responseTime + " ms");
```

### Check Success Status (Tests tab)
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});
```

---

## 🚀 Quick Start Checklist

- [ ] Start MongoDB
- [ ] Set environment variables in `.env`
- [ ] Run `npm install` in backend folder
- [ ] Run `npm start` to start server
- [ ] Import collection in Postman
- [ ] Set up environment variables
- [ ] Register a new user (Artisan)
- [ ] Save the token
- [ ] Test protected routes
- [ ] Register a Consumer
- [ ] Test consumer-specific routes

---

## 📝 Notes

1. **OTP**: Sent via email using Brevo - check your email inbox for OTP
2. **Tokens**: JWT tokens expire in 7 days (configurable in `.env`)
3. **IDs**: Replace example IDs with actual IDs from your database
4. **CraftTags**: You'll need to create CraftTag documents first before using them
5. **Email**: Use unique email addresses for each test user
6. **Server**: Make sure your server is running on `http://localhost:3001`
7. **Brevo**: Email service configured - OTPs are sent to real email addresses

---

## 🐛 Troubleshooting

**Issue**: "Access denied. No token provided."
- **Solution**: Make sure you've added the Authorization header with Bearer token

**Issue**: "Invalid token"
- **Solution**: Token might be expired. Login again to get a new token

**Issue**: "User not found"
- **Solution**: Make sure you've registered the user first

**Issue**: Connection refused
- **Solution**: Check if server is running on port 7000

---

Happy Testing! 🎉
