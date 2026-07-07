# sutraGram API Testing Summary

## Test Results Overview

### ✅ Working Endpoints (Successfully Tested)

#### Auth Routes
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/refresh-token` - Refresh JWT token
- ✅ `PUT /api/auth/language` - Update language preference
- ✅ `POST /api/auth/logout` - User logout

#### User Routes
- ✅ `GET /api/user/profile` - Get user profile (fixed craft_tags population issue)
- ✅ `PUT /api/user/profile` - Update user profile
- ✅ `PUT /api/user/settings` - Update user settings

#### Consumer Routes
- ✅ `GET /api/consumer/profile` - Get consumer profile
- ✅ `PUT /api/consumer/profile` - Update consumer profile
- ✅ `GET /api/consumer/addresses` - Get consumer addresses
- ✅ `GET /api/consumer/following` - Get followed artisans

---

## 🔧 Issues Fixed

### 1. User Profile Route - craft_tags Population Error
**Problem**: The `getProfile` endpoint was trying to populate `craft_tags` for all user types, but this field only exists for artisan profiles. This caused a schema error for consumer users.

**Solution**: Modified `/backend/controllers/userController.js` to only populate `craft_tags` when the user role is 'artisan'.

```javascript
// Only populate craft_tags for artisan profiles
if (user.role === 'artisan' && profile) {
    profile = await ProfileModel.findOne({ user: user._id })
        .populate('craft_tags', 'name_english name_vernacular type');
}
```

### 2. Artisan Routes - Route Order Conflict
**Problem**: The parameterized route `GET /api/artisan/:artisanId` was catching all requests including `/api/artisan/profile`, causing the protected route to never execute and throwing ObjectId cast errors.

**Solution**: Reordered routes in `/backend/routes/artisanRoute.js` to place specific routes before the catch-all parameterized route.

```javascript
// Protected routes MUST come BEFORE /:artisanId
router.get('/profile', authenticate, authorize('artisan'), getArtisanProfile);
// ... other specific routes ...
router.get('/:artisanId', getPublicArtisanProfile); // This should be LAST
```

---

## ⚠️ Known Issues & Validation Requirements

### Consumer Routes

#### 1. Update Interests Validation
- **Endpoint**: `PUT /api/consumer/interests`
- **Issue**: Requires minimum 3 interests
- **Test Data**: 
```json
{
  "selected_interests": ["Pottery", "Textiles", "Woodwork"]
}
```

#### 2. Update Preferences 
- **Endpoint**: `PUT /api/consumer/preferences`
- **Issue**: Expects ObjectId references to CraftTag documents, not string values
- **Requires**: CraftTag IDs from database
- **Note**: Need to query CraftTag collection first to get valid IDs

#### 3. Add Address Validation
- **Endpoint**: `POST /api/consumer/address`
- **Issue**: Validation error - check required fields
- **Test Data**:
```json
{
  "street": "123 Test Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India",
  "address_type": "home",
  "is_default": true
}
```

---

## 🔐 Authorization Testing

The role-based authorization is working correctly:
- Consumer users **cannot** access artisan-only routes
- Artisan routes properly return 403 Forbidden for non-artisan users
- Protected routes require valid JWT token in Authorization header

---

## 🚨 Deprecation Warnings

Multiple Mongoose deprecation warnings observed:
1. **findOneAndUpdate**: Using deprecated `new` option
   - **Fix**: Replace `new: true` with `returnDocument: 'after'`
   
2. **Duplicate Schema Indexes**: Multiple models have duplicate indexes
   - Models affected: User, SupplierProfile, ArtisanProfile, ConsumerProfile
   - **Fix**: Remove duplicate index definitions in model schemas

---

## 📝 Testing Your Token

Your working JWT token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OThlZmM0MTQ1Y2Y1N2I2YjZiNGE0ODciLCJpYXQiOjE3NzA5Nzk0NDMsImV4cCI6MTc3MTU4NDI0M30.OxUoGU93pnouqyGQxHiEXahGyqoQH7OrCayfyvxOOrw
```

User Details:
- **Email**: newtestuser@example.com
- **Role**: consumer
- **User ID**: 698efc4145cf57b6b6b4a487
- **Token Expires**: 7 days from login

---

## 🎯 Next Steps

1. **Fix Mongoose Deprecation Warnings**:
   - Update all `findOneAndUpdate` calls to use `returnDocument: 'after'`
   - Remove duplicate index definitions from model schemas

2. **Address Validation**:
   - Review ConsumerController address validation logic
   - Ensure all required fields are properly defined

3. **Preferences Feature**:
   - Requires CraftTag documents in database
   - Consider adding a seeder for test CraftTags

4. **Complete Testing**:
   - Test with an artisan user to verify artisan-specific routes
   - Test product, cart, and order routes (not yet implemented)
   - Test file upload routes if applicable

---

## 📚 API Documentation

For detailed API documentation, refer to:
- `/backend/API_DOCUMENTATION.md`
- `/backend/POSTMAN_GUIDE.md`

---

## 🔄 Test Script

Use the provided test script to quickly test all routes:
```bash
cd /Users/kartik./Developer/sutraGram/backend
chmod +x test-routes.sh
./test-routes.sh
```
