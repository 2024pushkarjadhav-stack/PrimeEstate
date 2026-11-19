# Experiment 5: Create Secure, Production-Ready RESTful APIs

---

## 1. Aim
To design, implement, and secure production-ready RESTful APIs for the **PrimeEstate – Real Estate Agent Management System** using Node.js, Express.js, MongoDB Atlas, and Mongoose, enforcing security best practices such as HTTP security headers, CORS policies, rate limiting, request size restrictions, input validation, and centralized error handling with proper HTTP status codes.

---

## 2. Theory

### 2.1 REST API Security Challenges
Modern web applications expose RESTful APIs to client applications and third-party integrations. Without robust safeguards, APIs face vulnerabilities such as:
1. **Cross-Site Scripting (XSS) & Clickjacking:** Attackers inject malicious scripts or iframe interfaces if security headers are omitted.
2. **Cross-Origin Resource Sharing (CORS) Misconfigurations:** Unrestricted origin access allows unauthorized domains to issue authenticated requests on behalf of victims.
3. **Denial of Service (DoS) & Brute Force Attacks:** Rapid, repetitive API requests exhaust server memory and database connections.
4. **Large Payload Exploitation:** Massive request payloads cause memory exhaustion and server crashes.
5. **NoSQL / Parameter Injection & Invalid ObjectIds:** Malformed database queries or bad IDs cause unhandled exceptions and server crashes.
6. **Data Leakage:** Sensitive details such as database credentials, stack traces, and password hashes must never be exposed in API responses or source control repositories.

### 2.2 Security Architecture in PrimeEstate
- **Helmet Middleware:** Automatically injects secure HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy`).
- **CORS Configuration:** Restricts cross-origin requests exclusively to the registered frontend (`http://localhost:5173`) while allowing required headers (`Content-Type`, `Authorization`).
- **Rate Limiting:** Enforces `express-rate-limit` allowing 150 requests per 15-minute window per IP to defend against brute force and DDoS.
- **Request Size Limiting:** Limits JSON and URL-encoded request bodies to `10mb`.
- **Input Validation via express-validator:** Validates required types, formats, string lengths, and email structures before passing execution to controllers.
- **Centralized Error Handling:** Catches Mongoose `CastError` (invalid MongoDB ObjectIds), `ValidationError`, and code `11000` (duplicate keys), returning clean JSON error responses with consistent HTTP status codes.

---

## 3. Implementation Details

### 3.1 Architecture & Middleware Stack
In `backend/server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// 1. Helmet HTTP Security Headers
app.use(helmet());

// 2. CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. Rate limiting (150 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in 15 minutes',
  },
});
app.use('/api', limiter);

// 4. Request body size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### 3.2 Centralized Error Handling (`backend/middleware/errorMiddleware.js`)
Captures all system and database exceptions, formatting them into standard responses:
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for '${field}'. A resource with this '${field}' already exists.`;
    error = new ErrorResponse(message, 409);
  }

  // Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
```

### 3.3 Input Validation (`backend/middleware/validateMiddleware.js`)
Uses `express-validator` to intercept malformed requests and return `400 Bad Request` before reaching controllers:
- `registerValidation`: Checks name presence, valid normalized email, minimum 6-character password, and valid role (`Buyer` or `Agent`).
- `propertyValidation`: Validates positive numeric prices, non-negative bedrooms/bathrooms, positive area, and required title/location.
- `leadValidation`: Validates customer name, email format, phone number, property ID, and message.
- `appointmentValidation`: Validates customer contact details, property ID, and appointment date.

### 3.4 Environment & Secret Protection
Configured via `backend/.env` and safeguarded from Git repositories via root `.gitignore` and `backend/.gitignore`:
- `PORT=5000`
- `NODE_ENV=development`
- `MONGO_URI=mongodb+srv://...`
- `JWT_SECRET=primeestate_super_secret_jwt_key_2026_secure`
- `JWT_EXPIRE=30d`
- `CLIENT_URL=http://localhost:5173`

---

## 4. Testing & Verification

| Test Scenario | Request | Expected Status | Response Summary |
|---|---|:---:|---|
| **Health Check** | `GET /api/health` | `200 OK` | `{"success": true, "message": "PrimeEstate API is operational"}` |
| **All Properties** | `GET /api/properties` | `200 OK` | `{"success": true, "count": 8, "data": [...]}` |
| **Invalid Route (404)** | `GET /api/unknown-endpoint` | `404 Not Found` | `{"success": false, "error": "Not Found - /api/unknown-endpoint"}` |
| **Invalid Mongo ID (404)** | `GET /api/properties/invalid123` | `404 Not Found` | `{"success": false, "error": "Resource not found with id of invalid123"}` |
| **Validation Error (400)** | `POST /api/leads` (empty body) | `400 Bad Request` | `{"success": false, "error": "Customer name is required"}` |
| **Duplicate Email (409)** | `POST /api/auth/register` (existing email) | `409 Conflict` | `{"success": false, "error": "A user with this email address already exists"}` |
| **Rate Limit Guard** | Exceeding 150 req / 15m | `429 Too Many Requests` | `{"success": false, "error": "Too many requests..."}` |

---

## 5. Conclusion
Experiment 5 successfully established a secure, production-grade REST API architecture for the PrimeEstate system. With Helmet headers, CORS policies, rate-limiting guards, express-validator input checks, and centralized error handling, the backend satisfies all industrial security standards and college practical requirements without exposing sensitive infrastructure details.
