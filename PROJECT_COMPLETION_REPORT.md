# PrimeEstate – Full Stack Semester Project Completion Report
**Project Name:** PrimeEstate – Real Estate Agent Management System  
**Technology Stack:** React 18, Vite, Tailwind CSS, Context API, Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, Helmet, CORS, express-rate-limit, express-validator, Socket.IO, Postman  
**Date of Audit & Completion:** November 19, 2026  
**Backend URL:** `http://localhost:5000`  
**Frontend URL:** `http://localhost:5173`  

---

## 1. Overall Project Status

- **Status:** **ALL EXPERIMENTS 1 THROUGH 8 ARE COMPLETE AND 100% OPERATIONAL.**
- **MongoDB Atlas Connectivity:** **Connected & Verified** (`ac-6fhyvqg-shard-00-00.z0u6vtj.mongodb.net`, Mongoose state = 1).
- **Postman Test Suite (Newman):** **26/26 Requests Executed, 39/39 Assertions Passed (0 Failed, 100% Pass Rate).**
- **WebSocket Real-Time Suite:** **8/8 Tests Passed (100% Pass Rate).**
- **Backend CI Unit Tests:** **5/5 Tests Passed (100% Pass Rate).**
- **Frontend Vite Build:** **Compiled in 6.99s with 0 errors.**

---

## 2. Experiment-Wise Completion Status (Experiments 1–8)

| Experiment # | Official Title | Status | Live Test Evidence |
| :--- | :--- | :---: | :--- |
| **Experiment 1** | Build responsive and interactive UIs using Tailwind CSS | **COMPLETE** | Responsive Navbar, Hero, Catalog, Detail Pages, Auth Pages, Agent Dashboard & Buyer Dashboard verified. Vite builds cleanly in 6.99s. |
| **Experiment 2** | Experiment based on React Hooks (useEffect, useContext, custom hooks) | **COMPLETE** | `useState`, `useEffect`, `useContext`, `useReducer`, `useApp()`, `useProperties()` actively driving live data and lifecycle cleanup. |
| **Experiment 3** | Manage complex state with Redux or Context API | **COMPLETE** | `AppContext.jsx` provides 17 centralized reducer actions syncing Auth, Properties, Appointments, Leads, Favorites, and Socket Notifications with `localStorage`. |
| **Experiment 4** | REST API Design with MongoDB + Mongoose Integration | **COMPLETE** | Connection buffering timeout resolved. Server awaits Atlas connection before listening. Full CRUD verified live against Atlas cluster with 0 errors. |
| **Experiment 5** | Create secure, production-ready RESTful APIs | **COMPLETE** | Helmet, CORS, Rate Limiting (150 req/15m), express-validator, and centralized error handler (200, 201, 400, 401, 403, 404, 409, 500) verified. |
| **Experiment 6** | Implement authentication and user roles with JWT | **COMPLETE** | Double bcrypt hashing bug resolved. JWT issuance & verification, password redaction (`select: false`), and Agent vs Buyer RBAC verified. |
| **Experiment 7** | Validating RESTful APIs using Postman | **COMPLETE** | Newman automated execution passed **26/26 requests** and **39/39 assertions** with automatic token and ID environment chaining. |
| **Experiment 8** | Enable real-time communication via WebSockets | **COMPLETE** | Socket.IO server & client with JWT handshake, role rooms (`role_Agent`), private user rooms (`user_<id>`), and NotificationBell badge verified. |

---

## 3. Files Created or Modified

1. **[`backend/config/db.js`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/backend/config/db.js)**:
   - Removed silent fallback to local MongoDB.
   - Configured DNS servers (`8.8.8.8`, `1.1.1.1`) for SRV resolution on Windows.
   - Set optimal connection parameters: `serverSelectionTimeoutMS: 10000`, `socketTimeoutMS: 45000`, `maxPoolSize: 10`.
   - Added connection lifecycle listeners: `disconnected`, `reconnected`, `error`.

2. **[`backend/server.js`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/backend/server.js)**:
   - Explicitly resolved `.env` path using `path.resolve(__dirname, '.env')`.
   - Wrapped startup in `async startServer()` which awaits `connectDB()` before `httpServer.listen()`, preventing Mongoose query buffering timeouts.
   - Updated `/api/health` to expose `database: 'connected' | 'disconnected'` and `databaseState: 1`.

3. **[`backend/seed.js`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/backend/seed.js)**:
   - Fixed the double bcrypt hashing defect where passwords were being hashed once in `seed.js` and a second time in Mongoose `pre('save')`.

4. **[`backend/fix-passwords.js`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/backend/fix-passwords.js)**:
   - Maintenance script created to reset test credentials on MongoDB Atlas for `agent@primeestate.com` and `buyer@primeestate.com` to `password123`.

5. **[`backend/controllers/leadController.js`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/backend/controllers/leadController.js)**:
   - Added Socket.IO emission to notify assigned agents and `role_Agent` when a buyer submits a new inquiry.

6. **[`frontend/src/context/AppContext.jsx`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/frontend/src/context/AppContext.jsx)**:
   - Added real-time Socket.IO listener for `lead:created` to sync incoming buyer inquiries into agent state.

7. **[`frontend/src/pages/DashboardPage.jsx`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/frontend/src/pages/DashboardPage.jsx)**:
   - Implemented dual dashboard rendering:
     - **Agent View:** Portfolio management with Add/Edit/Delete, customer leads management, tour appointment status update controls.
     - **Buyer View:** Profile banner, Buyer KPIs ("My Booked Visits", "Inquiries Sent", "Saved Favorites", "Active Catalog"), tabbed view for scheduled site tours, submitted inquiries, and interactive favorite property cards.

8. **[`frontend/src/components/Navbar.jsx`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/frontend/src/components/Navbar.jsx)**:
   - Updated desktop and mobile navigation so both Agent ("Agent Dashboard") and Buyer ("My Dashboard") can access their respective dashboard views.

9. **[`frontend/src/App.jsx`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/frontend/src/App.jsx)**:
   - Updated `/dashboard` protected route to allow both `['Agent', 'Buyer']`.

10. **[`backend/PrimeEstate_API_Collection.json`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/backend/PrimeEstate_API_Collection.json)** & **[`PrimeEstate_API_Collection.json`](file:///C:/Users/Pushkar/OneDrive/PrimeEstate/PrimeEstate_API_Collection.json)**:
    - Updated Postman collection chaining so deleting a newly created property restores `propertyId` to a permanent catalog property for subsequent lead and appointment tests.

---

## 4. Key Features Implemented

### User Roles & Capabilities
1. **Agent (`agent@primeestate.com` / `password123`)**:
   - Register and login with JWT issuance.
   - Access Agent Dashboard with 4 real-time KPIs.
   - Add new luxury properties (modal form with validation).
   - Edit existing properties (updates price, status, description).
   - Delete properties.
   - View and update status of customer inquiries (New -> Contacted -> Closed).
   - View and update status of site visit tours (Scheduled -> Confirmed -> Completed -> Cancelled).
   - Receive real-time push notifications on new leads and tour requests.

2. **Buyer (`buyer@primeestate.com` / `password123`)**:
   - Register and login with role tab selection.
   - Browse all luxury properties in catalog with search and price/bedroom filters.
   - View property detail pages with spec breakdown and agent contact card.
   - Submit property inquiries.
   - Schedule site visits with preferred date, time, and custom notes.
   - Access Buyer Dashboard to track booked tours and current status in real time.
   - Save and manage favorite properties with one-click heart toggle.
   - Receive real-time push notifications when an agent updates an appointment status.

---

## 5. Actual Test Results

### A. Postman / Newman Automated Test Results (Exp 7)
- **Total Requests:** 26 / 26 Executed
- **Total Assertions:** 39 / 39 Passed (100%)
- **Failed Assertions:** 0
- **Duration:** 2.8 seconds
- **Average Latency:** 27 ms

```text
┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │               26 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │               26 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                0 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               39 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 2.8s                                      │
├───────────────────────────────────────────────────────────────┤
│ total data received: 26.95kB (approx)                         │
├───────────────────────────────────────────────────────────────┤
│ average response time: 27ms [min: 2ms, max: 86ms, s.d.: 22ms] │
└───────────────────────────────────────────────────────────────┘
```

### B. WebSocket Socket.IO Test Suite (Exp 8)
- **File:** `backend/test-socket-direct.js`
- **Result:** **8 / 8 Tests Passed (100%)**
  - Public anonymous connection: Passed
  - Agent JWT handshake connection: Passed
  - Buyer JWT handshake connection: Passed
  - Ping-pong heartbeat: Passed
  - Property broadcast (`property:broadcast` -> `property:created`): Passed
  - Notification broadcast (`notification:new`): Passed
  - Role-targeted notification (`role_Agent`): Passed
  - Private user notification (`user_<id>`): Passed

### C. Backend CI Unit Test Suite (Exp 5 & 6)
- **File:** `backend/test/ci.test.js`
- **Result:** **5 / 5 Tests Passed (100%)**
  - Password Hashing & Verification (Bcrypt salt rounds 10): Passed
  - JSON Web Token (JWT) Signing & Claims Verification: Passed
  - CORS Policy Verification (Localhost & Vercel Domains): Passed
  - Custom ErrorResponse and Status Code Handler: Passed
  - Role-Based Access Control (RBAC) Logic: Passed

### D. Frontend Production Build (Exp 1)
- **Command:** `npm run build`
- **Result:** **Passed in 6.99s** (0 lint/bundle errors).

---

## 6. Failed Tests and Reasons

- **Current Status:** **0 Failed Tests.** All 39 Newman API assertions, 8 WebSocket tests, and 5 CI tests are passing with 100% success.
- **Previous Failure Root Causes Resolved:**
  1. *Operation properties.find() buffering timed out after 10000ms:* Caused because `server.js` was listening on port 5000 before Mongoose established connection to Atlas. Fixed by awaiting `connectDB()` inside `startServer()`.
  2. *401 Unauthorized on login:* Caused because `seed.js` was double-hashing passwords with bcrypt. Fixed by removing manual hash before `User.create()`.
  3. *Postman 404 on Create Lead / Book Appointment:* Caused because Delete Property was deleting the property ID stored in `propertyId`. Fixed by storing and restoring `catalogPropertyId`.

---

## 7. Remaining Issues

- **None.** All 8 experiments are fully implemented and verified against the live MongoDB Atlas cluster.
- **Note on Network Access:** MongoDB Atlas requires that the demonstrator's public IP address is allowed in Atlas Network Access. For college practical examinations or demonstrations across different Wi-Fi networks, keeping `0.0.0.0/0` (Allow from Anywhere) enabled in the MongoDB Atlas dashboard ensures the database connection never gets blocked by changing IP addresses.

---

## 8. Exact Backend and Frontend Startup Commands

Open two separate terminal windows:

### Terminal 1 – Start the Backend Server:
```bash
cd C:\Users\Pushkar\OneDrive\PrimeEstate\backend
npm start
```
*Expected Output:*
```text
[MongoDB Connected]: Successfully established connection to host: ac-6fhyvqg-shard-00-00.z0u6vtj.mongodb.net
[PrimeEstate DB]: Database connected and ready.
[PrimeEstate Server] Running in development mode on port 5000
[API Base]: http://localhost:5000/api
[WebSocket]: ws://localhost:5000 (Socket.IO active)
```

### Terminal 2 – Start the Frontend Client:
```bash
cd C:\Users\Pushkar\OneDrive\PrimeEstate\frontend
npm run dev
```
*Expected Output:*
```text
VITE v5.4.21 ready in 250 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 9. Exact URLs to Demonstrate

1. **Frontend Home Page:** `http://localhost:5173/`
2. **Listings & Filter Catalog:** `http://localhost:5173/listings`
3. **Property Detail Page:** `http://localhost:5173/property/6ac52fc594b3ad3a1274a958`
4. **Login Page:** `http://localhost:5173/login`
5. **Registration Page:** `http://localhost:5173/register`
6. **Agent / Buyer Dashboard:** `http://localhost:5173/dashboard`
7. **Backend API Health Check:** `http://localhost:5000/api/health`
8. **Backend Properties Endpoint:** `http://localhost:5000/api/properties`

---

## 10. Step-by-Step Teacher Demonstration Procedure

### Phase 1: Architecture & Backend Health (Experiments 4 & 5)
1. Open your browser and navigate to `http://localhost:5000/api/health`.
   - Point out to the examiner: `"database": "connected"`, `"databaseState": 1`, and `"success": true`.
2. Open `http://localhost:5000/api/properties`.
   - Show that 8 real properties are retrieved directly from MongoDB Atlas with populated agent references.
3. Show the examiner `backend/config/db.js` and `backend/server.js`:
   - Point out DNS fallback configuration (`8.8.8.8`).
   - Point out `await connectDB()` in `startServer()` before `httpServer.listen()`.
   - Point out Helmet, CORS, and Express Rate Limiter middleware.

### Phase 2: Postman REST API Validation (Experiment 7)
1. Open terminal and run:
   ```bash
   npx newman run backend/PrimeEstate_API_Collection.json -e backend/PrimeEstate_Environment.json
   ```
2. Show the examiner the clean output table:
   - **26 requests executed, 39 assertions passed, 0 failed.**
   - Show positive CRUD tests, token chaining, and negative security tests (400, 401, 403, 404).

### Phase 3: JWT Authentication & User Roles (Experiment 6)
1. Open `http://localhost:5173/login`.
2. Log in as an **Agent**:
   - Email: `agent@primeestate.com`
   - Password: `password123`
   - Show that the user is logged in as `Alexander Sterling` with the **Agent Dashboard (Pro)** link.
3. Open an Incognito/Private window and navigate to `http://localhost:5173/login`.
4. Log in as a **Buyer**:
   - Email: `buyer@primeestate.com`
   - Password: `password123`
   - Show that the user is logged in as `David Miller` with the **My Dashboard** link.

### Phase 4: Responsive UI, Hooks & State Management (Experiments 1, 2, 3)
1. On the Buyer session, go to `http://localhost:5173/listings`.
2. Use the search input and filter by "For Sale", price range, or bedrooms.
   - Explain to the examiner that `useProperties.js` (custom hook) handles the reactive filtering.
3. Click the heart icon on any property card to favorite it.
   - Show the favorite counter badge updating in the Navbar (managed via `AppContext.jsx`).
4. Click on a property card to open `http://localhost:5173/property/:id`.
   - Show the responsive image banner, spec pills, agent contact card, and two interactive tabs: "Send Inquiry" and "Schedule Site Visit".

### Phase 5: Real-Time WebSockets & Notifications (Experiment 8)
1. Arrange the two browser windows side-by-side:
   - **Left Window:** Agent (`Alexander Sterling`) on `http://localhost:5173/dashboard`.
   - **Right Window:** Buyer (`David Miller`) on `http://localhost:5173/property/6ac52fc594b3ad3a1274a958`.
2. On the **Buyer window**, switch to the **"Schedule Site Visit"** tab, pick a date/time, and click **"Confirm Site Visit Request"**.
3. Observe the **Left Window (Agent)** immediately:
   - The Notification Bell shows a glowing red unread badge (`1`).
   - Click the bell: an instant notification appears: *"David Miller booked a visit for 'The Grand Bellagio Villa'"*.
   - Under the "Appointments & Tours" tab on the dashboard, the new appointment appears in real time without refreshing the page!
4. On the **Agent window**, change the appointment status from `Scheduled` to `Confirmed`.
5. Observe the **Right Window (Buyer)** immediately:
   - The Buyer's Notification Bell lights up with: *"Site Visit Confirmed"*.
   - In the Buyer's Dashboard under "My Site Visits", the status badge turns green (`Confirmed`).

---

## 11. Screenshots to Capture for Your Viva / Exam File

1. **Screenshot 1 (Exp 1 - UI & Tailwind):**
   - Full homepage view showing the Hero section, value propositions, and luxury property grid.
2. **Screenshot 2 (Exp 1 & 6 - Dual Dashboards):**
   - Agent Dashboard showing the 4 KPI cards and Property Management table with Add/Edit/Delete buttons.
   - Buyer Dashboard showing "My Scheduled Property Tours" with status badges.
3. **Screenshot 3 (Exp 4 - MongoDB Atlas):**
   - Browser showing `http://localhost:5000/api/health` displaying `"database": "connected"`.
   - Terminal showing `[MongoDB Connected]: Successfully established connection to host: ac-6fhyvqg-shard-00-00.z0u6vtj.mongodb.net`.
4. **Screenshot 4 (Exp 5 - Security Middleware):**
   - Developer Tools Network Tab showing response headers: `Helmet` headers, `Access-Control-Allow-Origin`, and rate-limit headers.
5. **Screenshot 5 (Exp 6 - JWT & RBAC):**
   - Postman or browser showing `POST /api/auth/login` returning 200 with JWT `token` and redacted user object.
   - 403 Forbidden response when Buyer attempts to post to `/api/properties`.
6. **Screenshot 6 (Exp 7 - Postman / Newman):**
   - Command prompt showing the completed Newman run summary: **26/26 requests executed, 39/39 assertions passed, 0 failed**.
7. **Screenshot 7 (Exp 8 - WebSockets):**
   - Side-by-side dual browser showing the green live socket dot on the Notification Bell and the open notification panel displaying live push notifications.
8. **Screenshot 8 (Exp 8 - Terminal Socket Test):**
   - Terminal output from `node backend/test-socket-direct.js` showing **8/8 WEBSOCKET TESTS PASSED (100%)**.
