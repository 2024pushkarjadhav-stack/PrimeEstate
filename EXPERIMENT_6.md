# Experiment 6: JWT Authentication and Role-Based Authorization

---

## 1. Aim
To design, implement, and verify secure user authentication and role-based access control (RBAC) in the **PrimeEstate – Real Estate Agent Management System** using JSON Web Tokens (JWT), password hashing with `bcryptjs`, and role-based middleware (`Agent` vs `Buyer`), securing sensitive real estate operations and guaranteeing data privacy.

---

## 2. Theory

### 2.1 Authentication vs. Authorization
- **Authentication:** Verifying the identity of a client attempting to access the system (e.g., "Are you who you say you are?"). In PrimeEstate, authentication is performed via user registration and login with email and hashed password verification.
- **Authorization:** Determining whether an authenticated user has permission to perform a specific action or access a protected resource (e.g., "Do you have permission to perform this operation?"). In PrimeEstate, authorization is enforced via user roles: `Agent` and `Buyer`.

### 2.2 Password Hashing with Bcrypt
Storing plain-text passwords in databases is a catastrophic security vulnerability. PrimeEstate uses `bcryptjs` with salt rounds set to 10.
- A **Salt** is a cryptographically random string concatenated with the password before hashing, defeating rainbow table attacks.
- A **Work Factor / Rounds (10):** Ensures the hashing algorithm is computationally intensive enough to mitigate brute-force attacks while maintaining sub-second user login response times.
- In Mongoose, pre-save hooks (`UserSchema.pre('save')`) ensure passwords are automatically hashed whenever the password field is created or modified.

### 2.3 JSON Web Tokens (JWT) Architecture
A JSON Web Token is a compact, URL-safe means of representing claims between two parties.
A JWT consists of three base64url-encoded parts separated by dots (`.`):
1. **Header:** Algorithm & token type (e.g., `{"alg": "HS256", "typ": "JWT"}`).
2. **Payload:** Claims containing user identity and metadata (e.g., `id`, `role`, `email`, `name`, `iat`, `exp`).
3. **Signature:** Cryptographic signature calculated as `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET)`.

When a client makes protected API requests, it attaches the token in the HTTP `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

### 2.4 Role-Based Authorization Model in PrimeEstate

| Role | Permitted Actions | Forbidden Actions |
|---|---|---|
| **Agent** | • View all properties<br>• Create new properties (`POST /api/properties`)<br>• Update/delete owned properties (`PUT /api/properties/:id`)<br>• Manage received customer leads<br>• Manage assigned appointments | • Cannot access other agents' private records |
| **Buyer** | • Browse & filter property listings (`GET /api/properties`)<br>• View property details (`GET /api/properties/:id`)<br>• Book site visit appointments (`POST /api/appointments`)<br>• View their own appointments | • Cannot create/edit/delete properties (`403 Forbidden`)<br>• Cannot view other buyers' appointments |
| **Guest / Public** | • Browse published properties<br>• Access `/api/health` overview<br>• Register / Login | • Cannot access protected endpoints (`401 Unauthorized`) |

---

## 3. Implementation Details

### 3.1 User Model (`backend/models/User.js`)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Prevents password from leaking in API responses
    },
    phone: { type: String, trim: true, default: '' },
    role: {
      type: String,
      enum: ['Buyer', 'Agent'],
      default: 'Buyer',
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate signed JWT Token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email, name: this.name },
    process.env.JWT_SECRET || 'primeestate_super_secret_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### 3.2 Authentication Controller (`backend/controllers/authController.js`)
- `register`: Validates uniqueness (returns `409 Conflict` if email already registered), hashes password via pre-save hook, returns `201 Created` with signed token and sanitized user profile without password.
- `login`: Uses `.select('+password')` to compare hash with `matchPassword()`, returns `401 Unauthorized` for bad credentials, returns `200 OK` with token on match.
- `getMe`: Extracts `req.user.id` set by `protect` middleware and returns user details.

### 3.3 Auth & Role Middleware (`backend/middleware/authMiddleware.js`)
```javascript
// 1. Verify Bearer JWT
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route. Token missing.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ErrorResponse('User associated with this token no longer exists.', 401));
    }
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route. Invalid or expired token.', 401));
  }
});

// 2. Authorize Roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to perform this action.`,
          403
        )
      );
    }
    next();
  };
};
```

---

## 4. Endpoints & Route Protection

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user as `Agent` or `Buyer` |
| `POST` | `/api/auth/login` | Public | Authenticate user & retrieve JWT token |
| `GET` | `/api/auth/me` | Protected (`protect`) | Fetch currently logged in user profile |
| `POST` | `/api/properties` | Protected (`Agent` only) | Create new real estate property listing |
| `PUT` | `/api/properties/:id` | Protected (`Agent` only) | Update property listing details |
| `DELETE` | `/api/properties/:id` | Protected (`Agent` only) | Delete property listing |
| `GET` | `/api/properties` | Public | Browse and filter property listings |
| `POST` | `/api/appointments` | Public / Buyer | Book site visit appointment |
| `GET` | `/api/appointments` | Protected (`protect`) | Fetch private appointments for Agent/Buyer |

---

## 5. Testing & Verification

| Test Scenario | Request Details | Expected Code | Actual Code | Result |
|---|---|---|---|---|
| Register Agent | `POST /api/auth/register` with role `Agent` | `201 Created` | `201 Created` | **PASS** |
| Register Buyer | `POST /api/auth/register` with role `Buyer` | `201 Created` | `201 Created` | **PASS** |
| Duplicate Email Registration | `POST /api/auth/register` with existing email | `409 Conflict` | `409 Conflict` | **PASS** |
| Login with Valid Password | `POST /api/auth/login` with correct password | `200 OK` | `200 OK` | **PASS** |
| Login with Wrong Password | `POST /api/auth/login` with incorrect password | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| Fetch Profile (`/me`) | `GET /api/auth/me` with Bearer token | `200 OK` | `200 OK` | **PASS** |
| Request without Token | `GET /api/auth/me` without Bearer header | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| Request with Tampered Token | `GET /api/auth/me` with bad token string | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| Agent creates Property | `POST /api/properties` with Agent Bearer token | `201 Created` | `201 Created` | **PASS** |
| Buyer tries to create Property | `POST /api/properties` with Buyer Bearer token | `403 Forbidden` | `403 Forbidden` | **PASS** |

---

## 6. Screenshots Required for Practical Lab File

1. **Screenshot 1 – User Registration in Postman:**
   - URL: `POST http://localhost:5000/api/auth/register`
   - Body: JSON containing `name`, `email`, `password`, `role: "Agent"`.
   - Response: `201 Created` showing JWT token and user profile object without password.
2. **Screenshot 2 – User Login & Token Generation:**
   - URL: `POST http://localhost:5000/api/auth/login`
   - Response: `200 OK` with generated Bearer token.
3. **Screenshot 3 – MongoDB Atlas Password Hashing:**
   - View `users` collection in MongoDB Atlas showing that the `password` field contains a bcrypt hash starting with `$2a$10$` instead of plain text.
4. **Screenshot 4 – Role-Based Authorization Enforcement (403 Forbidden):**
   - URL: `POST http://localhost:5000/api/properties` using a Buyer's token.
   - Response: `403 Forbidden` stating `"User role 'Buyer' is not authorized to perform this action."`
5. **Screenshot 5 – Unauthorized Access Attempt (401 Unauthorized):**
   - URL: `GET http://localhost:5000/api/auth/me` with no token.
   - Response: `401 Unauthorized` stating `"Not authorized to access this route. Token missing."`

---

## 7. Conclusion
Experiment 6 was successfully implemented and verified. The PrimeEstate API securely authenticates users using bcrypt-hashed passwords and stateless JWT tokens, prevents password leakage across all responses, and reliably restricts privileged real estate agent operations using granular role-based authorization middleware.
