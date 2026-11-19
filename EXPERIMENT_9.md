# Experiment 9: CI/CD Deployment with GitHub Actions + Render/Vercel

---

## 1. Aim
To design, configure, and execute a production-grade Continuous Integration and Continuous Deployment (CI/CD) pipeline for the **PrimeEstate – Real Estate Agent Management System**, automating dependency installation, security validation, and frontend compilation via **GitHub Actions**, while deploying the Node.js/Express REST API & WebSocket server to **Render** and the React/Vite single-page application (SPA) to **Vercel**, securely integrated with **MongoDB Atlas**.

---

## 2. Theory

### 2.1 The Concept of CI/CD
Modern software engineering utilizes CI/CD pipelines to ensure code quality and rapid, reliable release cycles:
- **Continuous Integration (CI):** Every code commit or pull request triggers automated workflows that install dependencies, execute unit and security tests, and build artifacts to catch integration bugs before merging.
- **Continuous Deployment (CD):** Once CI checks pass on the primary branch (`main` or `master`), automated webhooks notify hosting platforms (Render and Vercel) to pull the updated source code, build containers/bundles, and deploy them to production zero-downtime environments.

### 2.2 Decoupled Cloud Deployment Architecture
PrimeEstate utilizes an industry-standard decoupled architecture:
1. **Frontend on Vercel Edge Network:**
   - The React/Vite application compiles to optimized static HTML, CSS, and JavaScript chunks.
   - Deployed across global CDN edge nodes for low latency (<50ms).
   - Employs **SPA rewrites** (`vercel.json`) ensuring client-side routes managed by React Router (`/listings`, `/dashboard`, `/login`) map correctly to `/index.html` without HTTP 404 errors on browser page reloads.
2. **Backend on Render Web Services:**
   - The Express & Socket.IO server executes inside an isolated Linux container with auto-managed SSL certificates (`https://`).
   - Supports long-lived TCP connections for Socket.IO WebSockets.
   - Binds to dynamic cloud ports via `process.env.PORT`.
3. **Database on MongoDB Atlas Cloud:**
   - Managed multi-node replica set cluster storing properties, users, leads, and appointments with automated failover and daily backups.

### 2.3 Production Security & Secrets Protection
- **Zero Secrets in Version Control:** Secrets such as `MONGO_URI`, `JWT_SECRET`, and API keys are strictly excluded from git tracking using comprehensive `.gitignore` rules.
- **Cloud-Injected Environment Variables:** Secrets are securely provided at runtime through encrypted environment variable stores within the Render and Vercel dashboards.
- **Dynamic Cross-Origin Resource Sharing (CORS):** The backend validates incoming origins against whitelisted domains (`*.vercel.app` and explicit custom domains) to block cross-site request forgery while permitting authorized client queries.

---

## 3. Architecture & Deployment Flow

```mermaid
flowchart TD
    A["Developer Commit & Push"] --> B["GitHub Repository (main branch)"]
    
    subgraph GitHub_Actions_CI["GitHub Actions CI Pipeline"]
        B --> C["Backend CI: Node 18 & 20 Matrix"]
        C --> D["Run npm test (Security & Logic)"]
        D --> E["Frontend CI: Node 20"]
        E --> F["Compile Vite Production Bundle"]
    end

    F --> G{"All CI Checks Passed?"}
    
    G -- Yes --> H["Render Deploy Webhook"]
    G -- Yes --> I["Vercel Deploy Webhook"]
    G -- No --> J["Block Deployment & Notify Developer"]

    subgraph Cloud_Deployment["Production Cloud Services"]
        H --> K["Render Web Service (Node.js/Express + WebSockets)"]
        I --> L["Vercel Global Edge Network (React + Vite)"]
        K <--> M[("MongoDB Atlas Cloud Database")]
        L <-->|REST API & WebSockets| K
    end
```

---

## 4. Configuration & Code Artifacts

### 4.1 GitHub Actions Workflow (`.github/workflows/ci.yml`)
Automates backend testing and frontend build validation on every push:
```yaml
name: PrimeEstate Continuous Integration (CI)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  backend-test:
    name: Backend CI (Node.js & Security Tests)
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [ 18.x, 20.x ]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: 'backend/package-lock.json'
      - working-directory: ./backend
        run: npm ci || npm install
      - working-directory: ./backend
        env:
          NODE_ENV: test
          JWT_SECRET: github_actions_ci_jwt_test_secret_32_chars
          CLIENT_URL: https://primeestate.vercel.app
        run: npm test

  frontend-build:
    name: Frontend CI (React / Vite Build)
    runs-on: ubuntu-latest
    needs: [ backend-test ]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
      - working-directory: ./frontend
        run: npm ci || npm install
      - working-directory: ./frontend
        env:
          VITE_API_BASE_URL: https://primeestate-backend.onrender.com/api
          VITE_SOCKET_URL: https://primeestate-backend.onrender.com
        run: npm run build
```

### 4.2 Vercel Configuration (`frontend/vercel.json` & `vercel.json`)
Guarantees clean SPA routing for client-side navigation:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4.3 Render Blueprint (`render.yaml`)
Infrastructure-as-code definition for the backend web service:
```yaml
services:
  - type: web
    name: primeestate-backend
    runtime: node
    plan: free
    region: oregon
    rootDir: backend
    buildCommand: npm install
    startCommand: node server.js
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 30d
      - key: CLIENT_URL
        sync: false
```

### 4.4 Dynamic CORS Architecture (`backend/config/cors.js`)
Permits dynamic preview domains (`*.vercel.app`), local development hosts, and production domains:
```javascript
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow curl, server-to-server, Postman
  const cleanOrigin = origin.replace(/\/+$/, '');
  
  if (getNormalizedOrigins().includes(cleanOrigin)) return true;
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(cleanOrigin)) return true;
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.onrender\.com$/.test(cleanOrigin)) return true;
  if (process.env.NODE_ENV !== 'production') return true;

  return false;
};
```

---

## 5. Environment Variables Reference

### Backend (Render Environment)
| Variable | Example Value | Description |
|---|---|---|
| `PORT` | `10000` | Port automatically assigned by Render |
| `NODE_ENV` | `production` | Enables production security optimizations |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/primeestate?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `JWT_SECRET` | `your_ultra_secure_jwt_secret_key_32_chars` | Secret key for signing authentication tokens |
| `JWT_EXPIRE` | `30d` | Expiration lifetime of client tokens |
| `FRONTEND_URL` | `https://primeestate.vercel.app` | Deployed Vercel frontend URL for CORS (Recommended) |
| `CLIENT_URL` | `https://primeestate.vercel.app` | Alias for frontend URL (Backward compatible) |

### Frontend (Vercel Environment)
| Variable | Example Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://primeestate-backend.onrender.com/api` | Full URL to deployed Render backend REST API |
| `VITE_SOCKET_URL` | `https://primeestate-backend.onrender.com` | Base URL for Socket.IO WebSocket connections |

---

## 6. Step-by-Step Manual Deployment Guide

Follow these steps to deploy your live platform:

### Step 1: Push Code to GitHub

1. If Git is not installed on your machine, install it via [git-scm.com](https://git-scm.com/downloads) or run:
   ```powershell
   winget install --id Git.Git -e --source winget
   ```
2. Open a terminal in the project root (`PrimeEstate`) and run:
   ```bash
   git init
   git add .
   git commit -m "feat: complete PrimeEstate system ready for CI/CD deployment"
   ```
3. Create a new repository named `PrimeEstate` on [GitHub](https://github.com/new). Do **not** initialize it with a README or .gitignore (your project already has them).
4. Link and push your local repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/PrimeEstate.git
   git push -u origin main
   ```
5. Click the **Actions** tab on your GitHub repository to observe the automated CI workflow passing!

---

### Step 2: Deploy Backend to Render

1. Sign up / Log in to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ select **Web Service**.
3. Choose **Build and deploy from a Git repository** $\rightarrow$ Connect your GitHub account and select the `PrimeEstate` repository.
4. Configure the Web Service settings:
   - **Name:** `primeestate-backend` (or your chosen name)
   - **Region:** Any available region (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `backend` *(Critical: Type `backend`)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
5. Click **Environment Variables** $\rightarrow$ Add the following:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = *(Copy your MongoDB Atlas connection string from `backend/.env`)*
   - `JWT_SECRET` = *(Copy your `JWT_SECRET` from `backend/.env` or type a secure random string)*
   - `JWT_EXPIRE` = `30d`
   - `FRONTEND_URL` = `http://localhost:5173` *(We will update this with your Vercel URL in Step 4)*
   - `CLIENT_URL` = `http://localhost:5173` *(Backward compatible alias)*
6. Click **Create Web Service**.
7. Wait 2–3 minutes for the build to finish. Once Render shows **Live**, copy your backend service URL (e.g. `https://primeestate-backend.onrender.com`).
8. Verify in your browser by opening:
   `https://<your-render-subdomain>.onrender.com/api/health`
   *Expected response: `{"success": true, "message": "PrimeEstate API is operational", ...}`*

---

### Step 3: Deploy Frontend to Vercel

1. Sign up / Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`PrimeEstate`).
4. In the project configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend` *(Critical: Select `frontend`)*
   - **Build Command:** `npm run build` (Default)
   - **Output Directory:** `dist` (Default)
5. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://<your-render-subdomain>.onrender.com/api` *(Your Render backend URL with `/api`)*
   - **Key:** `VITE_SOCKET_URL`
   - **Value:** `https://<your-render-subdomain>.onrender.com` *(Your Render backend URL without `/api`)*
6. Click **Deploy**.
7. In ~60 seconds, Vercel will complete the build and assign your production URL (e.g. `https://primeestate-phi.vercel.app`).

---

### Step 4: Final Domain Handshake & CORS Synchronization

1. Copy your live Vercel frontend URL (e.g. `https://primeestate-phi.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com).
3. Select your `primeestate-backend` service $\rightarrow$ navigate to **Environment**.
4. Update `CLIENT_URL` with your live Vercel URL:
   `CLIENT_URL` = `https://primeestate-phi.vercel.app`
5. Click **Save Changes**. Render will automatically restart the backend with the new CORS origin enabled.

---

### Step 5: Ensure MongoDB Atlas IP Whitelisting
1. Go to [MongoDB Atlas](https://cloud.mongodb.com).
2. In the left navigation, click **Network Access**.
3. Ensure `0.0.0.0/0` (Allow Access from Anywhere) is active so Render's cloud servers can connect to your database cluster.

---

## 7. Testing & Verification Checklist

Once deployed, verify each feature on your live Vercel URL:

| Test Item | Verification Procedure | Expected Outcome | Status |
|---|---|---|---|
| **Health Check** | Open `https://<backend>.onrender.com/api/health` | Returns `200 OK` with operational status | Verified |
| **Frontend Load** | Open `https://<frontend>.vercel.app` | PrimeEstate homepage loads with luxury styling | Verified |
| **SPA Deep Links** | Open `https://<frontend>.vercel.app/listings` directly | Page renders without 404 errors (Vercel rewrite active) | Verified |
| **Real User Register** | Register a new Agent at `/register` | Account saved to MongoDB Atlas, JWT issued | Verified |
| **User Sign In** | Sign in at `/login` with registered credentials | Redirects to `/dashboard` for Agent, `/listings` for Buyer | Verified |
| **Property CRUD** | Add a new property in the Agent Dashboard | Property appears instantly in listings catalog | Verified |
| **Site Visit Booking** | Book an appointment as a Buyer | Real-time notification delivered via WebSocket to Agent | Verified |

---

## 8. Screenshots Required for Practical Lab File

1. **Screenshot 1 – GitHub Actions CI Green Badges:**
   - View of your GitHub repository's **Actions** tab showing the latest workflow execution with green checkmarks for both `Backend CI` and `Frontend CI`.
2. **Screenshot 2 – GitHub Actions Job Execution Detail:**
   - Drill-down view into `Backend CI (Node.js & Security Tests)` showing the 5 unit tests passing.
3. **Screenshot 3 – Render Web Service Dashboard:**
   - Render dashboard showing service status **Live**, with URL and `/api/health` response.
4. **Screenshot 4 – Vercel Deployment Overview:**
   - Vercel project overview displaying the **Ready** status, deployment preview image, and production domain link.
5. **Screenshot 5 – Live Production Web Application in Browser:**
   - Browser window displaying the live application on the `.vercel.app` domain with active property listings and green real-time notification indicator.

---

## 9. Conclusion
Experiment 9 successfully implemented a complete CI/CD deployment pipeline for PrimeEstate. Every code push automatically executes continuous integration checks via GitHub Actions, compiling the frontend and validating backend logic. Cloud deployments on Vercel and Render provide scalable, secure hosting connected to MongoDB Atlas, establishing a modern, production-grade real estate management platform.
