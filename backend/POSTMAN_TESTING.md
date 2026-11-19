# Experiment 7: Validating RESTful APIs Using Postman

> Comprehensive guide for validating all REST API endpoints of the **PrimeEstate Real Estate Agent Management System** using Postman.

---

## 1. Overview & Setup

This guide walks through testing all 17 test cases covering **System Health**, **Authentication & User Roles (JWT)**, **Property CRUD**, **Customer Leads**, **Site Visit Appointments**, and **Security/Error Handling**.

### Prerequisites:
1. **Postman Desktop App** (or Postman Web)
2. **Node.js** (v18+)
3. **MongoDB Atlas** (Active connection configured in `backend/.env`)

---

## 2. Starting the Backend Server

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Start the Express backend server:
   ```bash
   npm start
   ```
   *The server runs at `http://localhost:5000`.*
   *Terminal should confirm:*
   ```
   [PrimeEstate Server] Running in development mode on port 5000
   [API Base]: http://localhost:5000/api
   [MongoDB Connected]: ac-6fhyvqg-shard-00-00.z0u6vtj.mongodb.net
   ```

---

## 3. Importing Files into Postman

Two files are available in your project:
- **Collection File:** `PrimeEstate_API_Collection.json`
- **Environment File:** `PrimeEstate_Environment.json`

### Import Instructions:
1. Open **Postman**.
2. Click the **Import** button in the top-left corner.
3. Drag and drop both `PrimeEstate_API_Collection.json` and `PrimeEstate_Environment.json`.
4. In the top-right environment selector dropdown, select **`PrimeEstate – Local Environment`**.

---

## 4. Postman Environment Variables

The environment file (`PrimeEstate_Environment.json`) is configured as follows:

| Variable | Initial Value | Description |
|---|---|---|
| `baseUrl` | `http://localhost:5000` | Target server URL |
| `token` | *(Dynamic)* | Current active Bearer JWT token |
| `agentToken` | *(Dynamic)* | Auto-saved JWT for Agent actions |
| `buyerToken` | *(Dynamic)* | Auto-saved JWT for Buyer actions |
| `userId` | *(Dynamic)* | Auto-saved ID of active user |
| `propertyId` | *(Dynamic)* | Auto-saved ID of active property |
| `leadId` | *(Dynamic)* | Auto-saved ID of active lead |
| `appointmentId` | *(Dynamic)* | Auto-saved ID of active site visit appointment |

> **Automated Token Capture:** The collection includes embedded Post-response test scripts (`pm.environment.set("token", ...)`). When you execute **Register Agent** or **Login Agent**, Postman automatically extracts and saves the JWT token into `{{agentToken}}` and `{{token}}`!

---

## 5. Complete Step-by-Step API Testing Catalog (All 17 Tests)

Follow this order to test every scenario:

### 1. Health Check
- **Endpoint:** `GET {{baseUrl}}/api/health`
- **Expected Status:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "PrimeEstate API is operational",
    "timestamp": "2026-10-06T...",
    "env": "development"
  }
  ```

---

### 2. Register Agent
- **Endpoint:** `POST {{baseUrl}}/api/auth/register`
- **Body:**
  ```json
  {
    "name": "Alexander Sterling",
    "email": "agent@primeestate.com",
    "password": "password123",
    "phone": "+1 (555) 234-5678",
    "role": "Agent"
  }
  ```
- **Expected Status:** `201 Created` *(or `409 Conflict` if already registered)*
- **Auto-action:** Saves `agentToken`, `token`, and `userId`.

---

### 3. Register Buyer
- **Endpoint:** `POST {{baseUrl}}/api/auth/register`
- **Body:**
  ```json
  {
    "name": "David Miller",
    "email": "buyer@primeestate.com",
    "password": "password123",
    "phone": "+1 (555) 987-6543",
    "role": "Buyer"
  }
  ```
- **Expected Status:** `201 Created` *(or `409 Conflict` if already registered)*
- **Auto-action:** Saves `buyerToken`.

---

### 4. Agent Login
- **Endpoint:** `POST {{baseUrl}}/api/auth/login`
- **Body:**
  ```json
  {
    "email": "agent@primeestate.com",
    "password": "password123"
  }
  ```
- **Expected Status:** `200 OK`
- **Auto-action:** Extracts signed JWT token and sets `{{token}}` and `{{agentToken}}`.

---

### 5. Buyer Login
- **Endpoint:** `POST {{baseUrl}}/api/auth/login`
- **Body:**
  ```json
  {
    "email": "buyer@primeestate.com",
    "password": "password123"
  }
  ```
- **Expected Status:** `200 OK`
- **Auto-action:** Saves `{{buyerToken}}`.

---

### 6. Current User Profile
- **Endpoint:** `GET {{baseUrl}}/api/auth/me`
- **Header:** `Authorization: Bearer {{token}}`
- **Expected Status:** `200 OK`
- **Verification:** User object is returned with `name`, `email`, `role`, and **no password**.

---

### 7. Get Properties (Catalog)
- **Endpoint:** `GET {{baseUrl}}/api/properties`
- **Expected Status:** `200 OK`
- **Auto-action:** Saves first property ID into `{{propertyId}}`.

---

### 8. Create Property (Agent Only)
- **Endpoint:** `POST {{baseUrl}}/api/properties`
- **Header:** `Authorization: Bearer {{agentToken}}`
- **Body:**
  ```json
  {
    "title": "Modern Sunset Villa with Infinity Pool",
    "location": "Beverly Hills, CA",
    "price": 3750000,
    "type": "For Sale",
    "status": "Active",
    "bedrooms": 5,
    "bathrooms": 5,
    "area": 5800,
    "description": "A masterpiece of contemporary architecture offering panoramic canyon vistas, high ceilings, custom Italian kitchen, and infinity pool.",
    "image": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
  }
  ```
- **Expected Status:** `201 Created`
- **Auto-action:** Saves newly created property ID into `{{propertyId}}`.

---

### 9. Update Property (Agent Only)
- **Endpoint:** `PUT {{baseUrl}}/api/properties/{{propertyId}}`
- **Header:** `Authorization: Bearer {{agentToken}}`
- **Body:**
  ```json
  {
    "price": 3650000,
    "status": "Pending",
    "description": "Price adjusted! A masterpiece of contemporary architecture offering panoramic canyon vistas and luxury amenities."
  }
  ```
- **Expected Status:** `200 OK`

---

### 10. Delete Property (Agent Only)
- **Endpoint:** `DELETE {{baseUrl}}/api/properties/{{propertyId}}`
- **Header:** `Authorization: Bearer {{agentToken}}`
- **Expected Status:** `200 OK`
- **Response:** `{"success": true, "data": {}, "message": "Property deleted successfully"}`

---

### 11. Leads (Customer Inquiries)
1. **Create Lead:**
   - **Endpoint:** `POST {{baseUrl}}/api/leads`
   - **Body:**
     ```json
     {
       "customerName": "Elena Rostova",
       "customerEmail": "elena.buyer@primeestate.com",
       "customerPhone": "+1 (555) 876-5432",
       "property": "{{propertyId}}",
       "message": "Interested in scheduling a VIP walkthrough this weekend."
     }
     ```
   - **Expected Status:** `201 Created`
2. **Get Leads:** `GET {{baseUrl}}/api/leads` (Header: `Authorization: Bearer {{agentToken}}`) $\rightarrow$ `200 OK`.
3. **Update Lead Status:** `PUT {{baseUrl}}/api/leads/{{leadId}}` (Body: `{"status": "Contacted"}`) $\rightarrow$ `200 OK`.

---

### 12. Appointments (Site Visits)
1. **Book Appointment:**
   - **Endpoint:** `POST {{baseUrl}}/api/appointments`
   - **Header:** `Authorization: Bearer {{buyerToken}}`
   - **Body:**
     ```json
     {
       "customerName": "David Miller",
       "customerEmail": "buyer@primeestate.com",
       "customerPhone": "+1 (555) 987-6543",
       "property": "{{propertyId}}",
       "date": "2026-09-30",
       "time": "02:00 PM",
       "notes": "Would like to inspect garage parking and smart home features."
     }
     ```
   - **Expected Status:** `201 Created`
2. **Get Appointments:** `GET {{baseUrl}}/api/appointments` (Header: `Authorization: Bearer {{agentToken}}`) $\rightarrow$ `200 OK`.
3. **Update Appointment Status:** `PUT {{baseUrl}}/api/appointments/{{appointmentId}}` (Body: `{"status": "Confirmed"}`) $\rightarrow$ `200 OK`.

---

### 13. Unauthorized Request (Missing Token)
- **Endpoint:** `GET {{baseUrl}}/api/auth/me` *(No Authorization Header)*
- **Expected Status:** `401 Unauthorized`
- **Response:** `{"success": false, "error": "Not authorized to access this route. Token missing."}`

---

### 14. Invalid Token
- **Endpoint:** `GET {{baseUrl}}/api/auth/me`
- **Header:** `Authorization: Bearer invalid.jwt.token.string`
- **Expected Status:** `401 Unauthorized`
- **Response:** `{"success": false, "error": "Not authorized to access this route. Invalid or expired token."}`

---

### 15. Forbidden Role (Buyer Calling Agent Endpoint)
- **Endpoint:** `POST {{baseUrl}}/api/properties`
- **Header:** `Authorization: Bearer {{buyerToken}}`
- **Body:** `{ "title": "Unauthorized Villa", "location": "Miami, FL", "price": 1000000, "type": "For Sale", "bedrooms": 3, "bathrooms": 2, "area": 2000, "description": "Testing role restriction." }`
- **Expected Status:** `403 Forbidden`
- **Response:** `{"success": false, "error": "User role 'Buyer' is not authorized to perform this action."}`

---

### 16. Invalid Request (Missing Required Fields)
- **Endpoint:** `POST {{baseUrl}}/api/leads`
- **Body:** `{ "customerName": "" }`
- **Expected Status:** `400 Bad Request`
- **Response:** `{"success": false, "errors": [...], "error": "Customer name is required"}`

---

### 17. Invalid Endpoint (404 Not Found)
- **Endpoint:** `GET {{baseUrl}}/api/nonexistent-route-xyz`
- **Expected Status:** `404 Not Found`
- **Response:** `{"success": false, "error": "Not Found - /api/nonexistent-route-xyz"}`

---

## 6. Screenshots Checklist for Practical File Submission

| # | Practical File Requirement | Screenshot to Capture |
|---|---|---|
| 1 | **Server Startup** | Terminal showing `[PrimeEstate Server] Running on port 5000` & `[MongoDB Connected]: ac-...` |
| 2 | **Health Check** | Postman test showing `GET /api/health` with `200 OK` |
| 3 | **Agent & Buyer Registration** | Postman showing `POST /api/auth/register` with `201 Created` & token generated |
| 4 | **Agent Login** | Postman showing `POST /api/auth/login` with `200 OK` & token |
| 5 | **JWT Profile Verification** | Postman showing `GET /api/auth/me` with Bearer token & password hidden |
| 6 | **Property CRUD** | Postman showing `POST /api/properties` (201) and `GET /api/properties` (200) |
| 7 | **Customer Leads & Visits** | Postman showing `POST /api/leads` (201) and `POST /api/appointments` (201) |
| 8 | **Negative Security Tests** | Postman showing `401 Unauthorized` (no token) & `403 Forbidden` (Buyer creating property) |
| 9 | **400 & 404 Error Tests** | Postman showing `400 Bad Request` (validation) & `404 Not Found` (invalid route) |
