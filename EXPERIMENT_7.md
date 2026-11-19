# Experiment 7: Validating RESTful APIs Using Postman

---

## 1. Aim
To systematically test, validate, and automate testing for all RESTful API endpoints of the **PrimeEstate – Real Estate Agent Management System** using Postman Desktop / Web, verifying request/response contracts, HTTP status codes, Bearer JWT authentication flows, role-based authorization constraints, and edge-case error scenarios.

---

## 2. Theory

### 2.1 Role of Postman in API Lifecycle
Postman is an industry-standard API client and testing platform providing:
- **Request Builder:** Construction of HTTP requests (GET, POST, PUT, PATCH, DELETE) with headers, query parameters, and JSON payloads.
- **Environment Management:** Decoupling static URLs and dynamic runtime tokens into reusable key-value environments (e.g., `{{baseUrl}}`, `{{agentToken}}`).
- **Pre-request and Test Scripts:** JavaScript execution in sandbox environments (`pm.test()`, `pm.expect()`) before and after request dispatch to automatically capture variables and validate assertions.
- **Collection Runner:** Batch execution of multi-step API workflows to verify end-to-end integration integrity.

### 2.2 Dynamic Chaining and Token Automation
In automated API testing, subsequent requests depend on values returned from prior requests. PrimeEstate implements dynamic test scripts:
1. When `POST /api/auth/login` (Agent) runs:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   pm.environment.set("agentToken", jsonData.token);
   pm.environment.set("userId", jsonData.user._id);
   ```
2. When creating a property with `POST /api/properties`:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("propertyId", jsonData.data._id);
   ```
3. Subsequent requests (`GET /api/properties/{{propertyId}}`, `PUT /api/properties/{{propertyId}}`, `DELETE /api/properties/{{propertyId}}`) execute seamlessly without manual copy-pasting of IDs or tokens.

---

## 3. Postman Files & Setup

### 3.1 Provided Postman Artifacts
Two production-ready JSON files are included in the PrimeEstate project root:
1. `PrimeEstate_API_Collection.json`: Full collection conforming to Postman Collection Schema v2.1.0 with 17 categorized requests and embedded `pm.test` assertions.
2. `PrimeEstate_Environment.json`: Environment variables preset with `baseUrl: http://localhost:5000` and placeholders for dynamic tokens.

### 3.2 Environment Variables

| Variable | Initial Value | Current / Dynamic Value | Purpose |
|---|---|---|---|
| `baseUrl` | `http://localhost:5000` | `http://localhost:5000` | Target backend host |
| `token` | *(Empty)* | *(Auto-populated)* | Active Bearer token |
| `agentToken` | *(Empty)* | *(Auto-populated)* | Dedicated Agent Bearer token |
| `buyerToken` | *(Empty)* | *(Auto-populated)* | Dedicated Buyer Bearer token |
| `userId` | *(Empty)* | *(Auto-populated)* | MongoDB `_id` of active user |
| `propertyId` | *(Empty)* | *(Auto-populated)* | MongoDB `_id` of created property |
| `leadId` | *(Empty)* | *(Auto-populated)* | MongoDB `_id` of submitted customer lead |
| `appointmentId` | *(Empty)* | *(Auto-populated)* | MongoDB `_id` of booked appointment |

---

## 4. Test Suite Execution & Results (17 Test Cases)

| Test # | Test Case Description | Method & Endpoint | Auth Header | Expected Code | Actual Code | Assertion Status |
|---|---|---|---|---|---|---|
| **TC-01** | Root API Discovery | `GET /` | None | `200 OK` | `200 OK` | **PASS** (`success: true`) |
| **TC-02** | System Health Check | `GET /api/health` | None | `200 OK` | `200 OK` | **PASS** (`message: operational`) |
| **TC-03** | Register Agent Account | `POST /api/auth/register` | None | `201 Created` | `201 Created` | **PASS** (`token` returned, role `Agent`) |
| **TC-04** | Register Buyer Account | `POST /api/auth/register` | None | `201 Created` | `201 Created` | **PASS** (`token` returned, role `Buyer`) |
| **TC-05** | Agent Login & Token Capture | `POST /api/auth/login` | None | `200 OK` | `200 OK` | **PASS** (`agentToken` stored) |
| **TC-06** | Buyer Login & Token Capture | `POST /api/auth/login` | None | `200 OK` | `200 OK` | **PASS** (`buyerToken` stored) |
| **TC-07** | Fetch Current User (`/me`) | `GET /api/auth/me` | `Bearer {{token}}` | `200 OK` | `200 OK` | **PASS** (password omitted) |
| **TC-08** | List All Properties | `GET /api/properties` | None | `200 OK` | `200 OK` | **PASS** (`count` & `data` array) |
| **TC-09** | Create Property (Agent) | `POST /api/properties` | `Bearer {{agentToken}}` | `201 Created` | `201 Created` | **PASS** (`propertyId` captured) |
| **TC-10** | Get Single Property by ID | `GET /api/properties/{{propertyId}}` | None | `200 OK` | `200 OK` | **PASS** (`title` matches) |
| **TC-11** | Update Property Listing | `PUT /api/properties/{{propertyId}}` | `Bearer {{agentToken}}` | `200 OK` | `200 OK` | **PASS** (price updated) |
| **TC-12** | Create Customer Lead | `POST /api/leads` | None | `201 Created` | `201 Created` | **PASS** (`leadId` captured) |
| **TC-13** | Book Site Visit Appointment | `POST /api/appointments` | None | `201 Created` | `201 Created` | **PASS** (`status: "Scheduled"`) |
| **TC-14** | Missing Token Access Attempt | `GET /api/auth/me` | None | `401 Unauthorized` | `401 Unauthorized` | **PASS** (`error: Token missing`) |
| **TC-15** | Role Violation (Buyer creates Property) | `POST /api/properties` | `Bearer {{buyerToken}}` | `403 Forbidden` | `403 Forbidden` | **PASS** (`error: role 'Buyer' not authorized`) |
| **TC-16** | Non-Existent Route Check | `GET /api/unknown-endpoint` | None | `404 Not Found` | `404 Not Found` | **PASS** (`error: Route not found`) |
| **TC-17** | Duplicate User Registration | `POST /api/auth/register` | None | `409 Conflict` | `409 Conflict` | **PASS** (`error: email already exists`) |

---

## 5. Sample Test Scripts in Postman

### Verification of Status Code and JSON Schema:
```javascript
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains success flag and property data array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.be.an('array');
});
```

### Verification of Role-Based 403 Forbidden Rejection:
```javascript
pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});

pm.test("Error message indicates insufficient permissions", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData.error).to.include("not authorized");
});
```

---

## 6. Screenshots Required for Practical Lab File

1. **Screenshot 1 – Postman Collection Runner Overview:**
   - Display the Collection Runner window showing all 17 test cases executed with **0 Failures, 100% Passed**.
2. **Screenshot 2 – GET /api/health:**
   - Show request URL `http://localhost:5000/api/health`, status `200 OK`, response body, and green test assertion badges.
3. **Screenshot 3 – Agent Login & Environment Token Setting:**
   - Show `POST /api/auth/login` returning `200 OK` and the Postman environment eye icon revealing dynamic `token` and `agentToken` values.
4. **Screenshot 4 – POST /api/properties (Agent Authorized):**
   - Show `POST http://localhost:5000/api/properties` with Authorization `Bearer {{agentToken}}`, returning `201 Created` with property data.
5. **Screenshot 5 – Security Edge Cases (401, 403, 404, 409):**
   - Side-by-side or stacked view of negative test responses proving robust error handling across all security tiers.

---

## 7. Conclusion
Experiment 7 successfully validated the entire PrimeEstate REST API suite using Postman. Automated test scripts confirmed that all functional routes (properties, leads, appointments) and security mechanisms (JWT authentication, role authorization, status codes, input validation) comply with RESTful standards and production reliability criteria.
