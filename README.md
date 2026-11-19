# PrimeEstate – Real Estate Agent Management System

> **Full Stack Semester Project** implementing **Experiments 1 through 6** using **JavaScript (ES6+)**, React 18, Tailwind CSS, Express.js, MongoDB, Mongoose, and JWT Authentication.

---

## Project Overview

**PrimeEstate** is a modern, responsive full stack real estate marketplace and agent CRM platform. It empowers **Buyers/Tenants** to discover luxury properties, filter listings by budget and specifications, save favorites, submit inquiries, and book property site visits. Simultaneously, it provides **Real Estate Agents** with a dedicated portal to manage property portfolios, track incoming customer leads, coordinate visit appointments, and analyze key business metrics.

---

## Experiments Breakdown (1 to 6)

### Experiment 1: Responsive and Interactive UI Using Tailwind CSS
- **Design System**: Luxury navy/slate theme (`#0B132B`, `#1C2541`), blue accents, and amber/gold CTAs (`#D97706`, `#F59E0B`).
- **Navbar**: Responsive navigation with brand logo (`Building2`), catalog links, Pro Agent badge, favorites counter, auth dropdown, and mobile menu drawer.
- **Hero Section**: Headline *"Find Your Perfect Property with the Right Agent"*, trust badges, and interactive multi-field search bar.
- **Property Cards**: High-resolution architectural imagery, price badges, bed/bath/sqft specs, favorite heart toggle with instant animation, agent tags, and quick-view actions.
- **Listings Catalog**: Multi-faceted filter system (For Sale / Rent, budget range, bedrooms), sorting orders, and responsive grid layout.
- **Authentication**: Responsive Login and Register pages with password visibility toggles, role selectors, and 1-click demo autofill buttons.
- **Agent Dashboard**: 4 KPI statistic cards (*Total Properties*, *Active Leads*, *Site Visits*, *Closed Deals*) and management tables.

### Experiment 2: React Hooks
- `useState`: Form inputs, search filters, modal open/close states, password visibility toggle, active tabs.
- `useEffect`: API data fetching, session restoration from `localStorage`, window scroll resets, initial demo seed synchronization.
- `useContext`: Shared auth, user role, properties, favorites, leads, and appointments across all components.
- `useProperties.js` *(Custom Hook)*: Manages property state, keyword search, price range filtering, bedroom filtering, sort algorithms, and memoized result caching.

### Experiment 3: Complex State Management with Context API & useReducer
- **`AppContext.jsx`** powered by `useReducer`:
  - **Auth State**: `currentUser`, `token`, `isAuthenticated`, `userRole`
  - **Properties State**: `properties`, `selectedProperty`, `loading`, `error`
  - **Favorites State**: `favorites` persisted in `localStorage`
  - **Leads CRM**: `leads` list, status transitions (*New* $\rightarrow$ *Contacted* $\rightarrow$ *Closed*)
  - **Appointments**: `appointments` list, status transitions (*Scheduled* $\rightarrow$ *Confirmed* $\rightarrow$ *Completed* $\rightarrow$ *Cancelled*)
- **Reducer Actions**: `LOGIN`, `LOGOUT`, `SET_PROPERTIES`, `ADD_PROPERTY`, `UPDATE_PROPERTY`, `DELETE_PROPERTY`, `TOGGLE_FAVORITE`, `SET_LEADS`, `ADD_LEAD`, `UPDATE_LEAD`, `SET_APPOINTMENTS`, `ADD_APPOINTMENT`, `UPDATE_APPOINTMENT`, `SET_LOADING`, `SET_ERROR`.

### Experiment 4: REST API Design with MongoDB & Mongoose
- **Mongoose Models**:
  - `User`: `name`, `email`, `password` (hashed with `bcryptjs`), `phone`, `role` (`'Buyer' | 'Agent'`)
  - `Property`: `title`, `location`, `price`, `type` (`'For Sale' | 'For Rent'`), `status`, `bedrooms`, `bathrooms`, `area`, `description`, `image`, `agent`
  - `Lead`: `customerName`, `customerEmail`, `customerPhone`, `property`, `agent`, `message`, `status` (`'New' | 'Contacted' | 'Closed'`)
  - `Appointment`: `customer`, `customerName`, `customerEmail`, `customerPhone`, `property`, `agent`, `date`, `time`, `notes`, `status`
- **Database Seeder (`seed.js`)**: Seeds 4 demo accounts (2 Agents, 2 Buyers), 8 realistic luxury properties, initial leads, and site visit schedules.

### Experiment 5: Secure Production-Ready REST APIs
- **Security Headers**: `helmet` configured on all HTTP responses.
- **CORS**: Configured for frontend origins with credential support.
- **Rate Limiting**: `express-rate-limit` (150 requests per 15-minute window).
- **Input Validation**: `express-validator` on registration, login, properties, leads, and appointments.
- **Centralized Error Handling**: `errorMiddleware.js` handles Mongoose `CastError` (invalid MongoDB ObjectIds), `ValidationError`, and code 11000 duplicate keys without crashing.
- **Password Protection**: Passwords stored as `bcrypt` hashes (salt 10) and excluded with `select: false`.

### Experiment 6: Authentication and User Roles Using JWT
- **Endpoints**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- **JWT Signing & Verification**: Signed tokens containing user ID and role with expiration.
- **Role-Based Authorization**:
  - `protect`: Verifies Bearer token in request authorization header.
  - `authorize('Agent')`: Restricts property creation, editing, deletion, and agent CRM leads to agents only.
- **Frontend Route Protection**: `ProtectedRoute.jsx` prevents unauthorized buyers or guests from accessing `/dashboard`.

### Experiment 7: Validating RESTful APIs Using Postman
- **Postman Collection**: `PrimeEstate_API_Collection.json` with 20+ request suites covering Auth, Properties CRUD, Leads CRM, Site Visits, and User Directory.
- **Environment Config**: `PrimeEstate_Environment.json` with dynamic token capture scripts (`{{token}}`, `{{agentToken}}`, `{{buyerToken}}`, `{{propertyId}}`, etc.).
- **Response Validation**: Tests status codes `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.
- **Documentation**: Detailed testing walkthrough provided in `backend/POSTMAN_TESTING.md`.

---

## Folder Structure

```
PrimeEstate/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe
│   │   ├── propertyController.js    # CRUD for Properties
│   │   ├── userController.js        # User directory lookups
│   │   ├── leadController.js        # Customer inquiries CRM
│   │   └── appointmentController.js # Site visit appointment booking
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT protect & role authorize
│   │   ├── errorMiddleware.js       # Centralized 404 & error handlers
│   │   └── validateMiddleware.js    # express-validator request rules
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt & JWT
│   │   ├── Property.js              # Property schema with agent ref
│   │   ├── Lead.js                  # Lead schema linked to property/agent
│   │   └── Appointment.js           # Appointment schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── userRoutes.js
│   │   ├── leadRoutes.js
│   │   └── appointmentRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js          # Async wrapper
│   │   └── errorResponse.js         # Custom Error class
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── seed.js                      # Database seed script
│   └── server.js                    # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg              # Luxury brand favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive header with role badges
│   │   │   ├── Footer.jsx           # Brand footer
│   │   │   ├── Hero.jsx             # Luxury navy hero section
│   │   │   ├── SearchPanel.jsx      # Multi-field search & filters
│   │   │   ├── PropertyCard.jsx     # Property card with badges & favorite heart
│   │   │   ├── PropertyModal.jsx    # Quick view modal with inquiry/visit forms
│   │   │   ├── PropertyForm.jsx     # Add/Edit property form for agents
│   │   │   ├── StatCard.jsx         # KPI metric card
│   │   │   └── ProtectedRoute.jsx   # Route guard for Agent role
│   │   ├── context/
│   │   │   └── AppContext.jsx       # Context API + useReducer
│   │   ├── data/
│   │   │   └── demoData.js          # Offline fallback & demo accounts
│   │   ├── hooks/
│   │   │   └── useProperties.js     # Custom hook for property search/filters
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Home page with featured listings
│   │   │   ├── ListingsPage.jsx     # Full catalog with search/filters
│   │   │   ├── PropertyDetailsPage.jsx # Full property details & booking
│   │   │   ├── LoginPage.jsx        # Login with 1-click demo buttons
│   │   │   ├── RegisterPage.jsx     # Register with Buyer/Agent selector
│   │   │   └── DashboardPage.jsx    # Agent Dashboard & CRM
│   │   ├── services/
│   │   │   └── api.js               # Axios client with JWT interceptor
│   │   ├── App.jsx                  # React Router routes
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind directives
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router v6, Axios, Lucide React |
| **State Management** | React Context API with `useReducer` and custom hook `useProperties` |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication & Security** | JSON Web Tokens (JWT), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `express-validator` |

---

## Quick Demo Credentials

For testing and presentation purposes, 1-Click Demo Login buttons are available directly on the Login page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Real Estate Agent** | `agent@primeestate.com` | `password123` | Full Dashboard, Add/Edit/Delete Properties, Manage Leads, Manage Appointments |
| **Buyer / Tenant** | `buyer@primeestate.com` | `password123` | Browse Listings, Save Favorites, Submit Inquiries, Book Site Visits |

---

## Setup & Running Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local MongoDB Community Server running at `mongodb://localhost:27017` OR a MongoDB Atlas cloud URI)
  > *Note: If MongoDB is not running locally, the frontend will automatically load the comprehensive built-in demo dataset without breaking.*

---

### 2. Backend Setup & Run

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
npm install
```

#### Configure Environment Variables
A default `.env` file is already created. To adjust the MongoDB connection string or port, edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/primeestate
JWT_SECRET=primeestate_super_secret_jwt_key_2026_secure
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

#### (Optional) Seed Sample Data into MongoDB
If MongoDB is running, populate it with realistic properties and demo users:

```bash
npm run seed
```

#### Start Backend Server
```bash
npm start
```
The API server will run at **`http://localhost:5000`**.

---

### 3. Frontend Setup & Run

Open a second terminal and navigate to the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run at **`http://localhost:5173`**.

---

## REST API Endpoints Catalog

### Authentication
- `POST /api/auth/register` — Register a new Buyer or Agent
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET  /api/auth/me` — Retrieve current authenticated user profile *(Protected)*

### Properties
- `GET    /api/properties` — Get all properties (supports `?type=`, `?search=`, `?minPrice=`, `?maxPrice=`, `?bedrooms=`)
- `GET    /api/properties/:id` — Get single property details by ID
- `POST   /api/properties` — Create new property listing *(Agent only)*
- `PUT    /api/properties/:id` — Update property listing *(Agent only - Owner)*
- `DELETE /api/properties/:id` — Delete property listing *(Agent only - Owner)*

### Leads / Customer Inquiries
- `GET  /api/leads` — Get inquiries for agent's properties or buyer's inquiries *(Protected)*
- `POST /api/leads` — Submit customer inquiry for a property *(Public / Buyer)*
- `PUT  /api/leads/:id` — Update inquiry status: `New`, `Contacted`, `Closed` *(Agent only)*

### Appointments / Site Visits
- `GET  /api/appointments` — Get site visit bookings *(Protected)*
- `POST /api/appointments` — Book a property walkthrough tour *(Public / Buyer)*
- `PUT  /api/appointments/:id` — Update appointment status: `Scheduled`, `Confirmed`, `Completed`, `Cancelled` *(Protected)*

### System Health
- `GET /api/health` — API status and uptime check
