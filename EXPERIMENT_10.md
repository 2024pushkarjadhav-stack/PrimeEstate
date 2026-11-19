# Experiment 10: Deploy Full Stack Applications using DevOps Tools and Docker

---

## 1. Aim
To design, containerize, orchestrate, and verify the **PrimeEstate – Real Estate Agent Management System** using modern DevOps practices, **Docker**, and **Docker Compose**, implementing lightweight multi-stage builds, non-root security contexts, native health checks, and an **Nginx reverse proxy** to serve the React 18 single-page application (SPA), proxy REST API traffic, and upgrade real-time Socket.IO WebSockets securely connected to a **MongoDB Atlas** cloud cluster.

---

## 2. Theory

### 2.1 The Role of Containerization in DevOps
In traditional application deployments, subtle differences between developer workstations (Windows/macOS) and staging/production servers (Linux) lead to the notorious *"It works on my machine!"* dilemma. Variations in Node.js runtime versions, global npm binaries, operating system packages, and network configurations introduce configuration drift and deployment failures.

**Docker** solves this by packaging the application code, runtime engine, system libraries, configuration files, and dependencies into immutable, self-contained units known as **Containers**. 

### 2.2 Containerization vs. Virtualization
| Feature | Virtual Machines (VMs) | Docker Containers |
|---|---|---|
| **Architecture** | Hypervisor-based (Hardware level) | Container Engine / OS-level virtualization |
| **Guest OS** | Full guest OS per VM (GBs in size) | Shares host Linux/WSL2 kernel |
| **Startup Time** | Minutes | Milliseconds to seconds |
| **Resource Overhead** | High CPU, RAM, and disk footprint | Minimal overhead, near-native performance |
| **Portability** | Heavy VM disk images (.vmdk, .ova) | Lightweight OCI-compliant layered images |

### 2.3 Multi-Stage Docker Builds
Single-stage Docker images for frontend applications typically bundle full Node.js runtimes, package managers, and development toolchains into the final image, bloating sizes beyond 1 GB.

A **Multi-Stage Build** resolves this by dividing the build lifecycle into distinct isolated stages:
1. **Builder Stage (`node:20-alpine`):** Copies package definitions, downloads full development and build dependencies, injects Vite build arguments (`VITE_API_BASE_URL`, `VITE_SOCKET_URL`), and compiles React source code into optimized, minified static HTML, CSS, and JavaScript chunks inside `/app/dist`.
2. **Production Runtime Stage (`nginx:alpine`):** Discards the entire Node.js runtime, build tools, source code, and `node_modules`. It extracts *only* the compiled static assets from the builder stage and copies them into Nginx's document root (`/usr/share/nginx/html`).
3. **Result:** The final production frontend image measures merely **26.5 MB**, dramatically shrinking the attack surface, eliminating runtime vulnerability vectors, and accelerating container pull/deploy times.

### 2.4 Single-Origin Reverse Proxy Architecture
In modern full-stack web architectures, running the frontend (port 3000) and backend (port 5000) on separate origins forces browsers to enforce Cross-Origin Resource Sharing (CORS) preflight checks (`OPTIONS` requests), exposing backend endpoints directly to the client network.

PrimeEstate uses an **Nginx Reverse Proxy** inside the frontend container:
- **Client Entry Point (`http://localhost:3000`):** Browsers communicate exclusively with Nginx on port 3000.
- **SPA Client-Side Routing:** Direct navigation to client-side routes like `/listings` or `/dashboard` is handled via Nginx's `try_files $uri $uri/ /index.html;`, avoiding HTTP 404 errors on browser refresh.
- **API Upstream Proxying:** Requests to `/api/*` are transparently proxied across the internal Docker bridge network to `http://backend:5000/api/*`.
- **WebSocket Protocol Upgrades:** Real-time Socket.IO connections (`/socket.io/*`) have their HTTP connection upgraded to full-duplex TCP WebSockets via `proxy_set_header Upgrade $http_upgrade;` and `proxy_set_header Connection "upgrade";`.
- **Security & Performance:** Eliminates CORS latency, provides Gzip compression on static assets, and shields the Node.js application server behind a high-concurrency reverse proxy.

### 2.5 Multi-Container Orchestration with Docker Compose
**Docker Compose** is an infrastructure-as-code tool for defining and coordinating multi-container applications. Using a declarative `docker-compose.yml` file, it:
1. Creates a custom, isolated bridge network (`primeestate-network`) with automatic DNS resolution between service names (`backend` and `frontend`).
2. Injects environment variables securely from existing `.env` files without hardcoding credentials in git.
3. Coordinates startup sequencing via health-check dependencies (`depends_on: backend: condition: service_healthy`), ensuring Nginx never starts serving web requests until the backend is fully connected to MongoDB Atlas.

---

## 3. PrimeEstate Docker Architecture

```mermaid
flowchart TD
    Client["Client Browser / Postman\n(http://localhost:3000)"]
    
    subgraph Host["Host Machine (Windows / WSL2 Engine)"]
        subgraph BridgeNet["Custom Docker Network (primeestate-network)"]
            subgraph FrontendContainer["Container: primeestate-frontend (nginx:alpine)\nPort: 3000 -> 80"]
                NginxRouter["Nginx Reverse Proxy & HTTP Server"]
                StaticFiles["React 18 Production Bundle\n(/usr/share/nginx/html)"]
                HealthCheckFE["Nginx Health Check (/health)"]
            end
            
            subgraph BackendContainer["Container: primeestate-backend (node:20-alpine)\nPort: 5000 -> 5000"]
                NodeServer["Node.js / Express Server (server.js)\nUser: node (Non-root)"]
                SocketServer["Socket.IO Real-time Engine"]
                HealthCheckBE["Node fetch Health Check (/api/health)"]
            end
        end
    end
    
    CloudDB[("MongoDB Atlas Cloud Cluster\n(replica set over TLS)")]

    Client -->|HTTP GET /listings| NginxRouter
    NginxRouter -->|Serves Static Asset / SPA Fallback| StaticFiles
    Client -->|REST API: /api/*| NginxRouter
    NginxRouter -->|Reverse Proxy HTTP: backend:5000/api/*| NodeServer
    Client -->|WebSockets: /socket.io/*| NginxRouter
    NginxRouter -->|HTTP 101 Switching Protocols Upgrade| SocketServer
    NodeServer <-->|Mongoose Driver (TLS/SRV)| CloudDB
```

---

## 4. Docker Configurations & Code Artifacts

### 4.1 Backend Dockerfile (`backend/Dockerfile`)
Production-ready, hardened Node.js containerfile with layer caching and a non-root security context:

```dockerfile
# ==============================================================================
# PrimeEstate Backend - Production Dockerfile
# Multi-stage optimized Node.js 20 LTS Alpine Image
# ==============================================================================
FROM node:20-alpine AS base

# Install dumb-init or dependencies if needed for signal handling
WORKDIR /app

# Set node environment
ENV NODE_ENV=production

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --only=production --ignore-scripts \
    && npm cache clean --force

# Copy application source code
COPY . .

# Ensure non-root user 'node' owns the application directory for security
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose backend port
EXPOSE 5000

# Health check to verify Express server and MongoDB connection status
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"

# Launch backend application
CMD ["node", "server.js"]
```

#### Key Engineering Decisions in `backend/Dockerfile`:
- **`node:20-alpine`:** Minimizes image size from 1.1 GB (Debian base) down to 63.6 MB while retaining Node 20 LTS security features.
- **Layer Caching (`COPY package*.json ./`):** Separating dependency manifest copy from code copy prevents unnecessary `npm install` runs whenever only source code changes.
- **`npm ci --only=production`:** Ensures deterministic, exact installations based on `package-lock.json` while excluding developer dependencies.
- **Non-Root Execution (`USER node`):** Aligns with principle of least privilege, preventing potential container breakout vulnerabilities from gaining host root access.
- **Native Health Check (`HEALTHCHECK`):** Uses Node 20's native global `fetch` API to query `/api/health`, avoiding extra utilities like `curl` or `wget`.

---

### 4.2 Frontend Dockerfile (`frontend/Dockerfile`)
Two-stage build that compiles the React 18 SPA and serves it via an ultra-light Nginx Alpine web server:

```dockerfile
# ==============================================================================
# PrimeEstate Frontend - Multi-Stage Production Dockerfile
# Stage 1: Build React 18 / Vite Static Bundle
# Stage 2: Serve with Lightweight Nginx Alpine Web Server
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first for layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies required for vite build)
RUN npm ci

# Copy frontend source files
COPY . .

# Set build-time environment arguments (proxied via Nginx reverse proxy)
ENV VITE_API_BASE_URL=/api
ENV VITE_SOCKET_URL=/

# Build optimized production bundle to /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Nginx Server
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default nginx static html files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Health check to ensure Nginx is healthy and serving pages
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/health || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
```

---

### 4.3 Nginx Reverse Proxy Configuration (`frontend/nginx.conf`)
High-performance reverse proxy configuration handling routing, proxying, caching, and WebSocket handshakes:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name localhost;

    # Gzip compression for high-performance asset delivery
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Root directory pointing to compiled React build
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Internal health check endpoint for Docker container monitoring
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # SPA Client-Side Routing: fallback all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching optimization (1 year cache for fingerprinted Vite assets)
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|woff|woff2|ttf)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public";
    }

    # Reverse Proxy REST API requests to Backend container
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Reverse Proxy Socket.IO WebSockets to Backend container
    location /socket.io/ {
        proxy_pass http://backend:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Error handling
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

### 4.4 Docker Compose Orchestration (`docker-compose.yml`)
Declarative multi-container configuration coordinating networking, environment injection, and dependencies:

```yaml
services:
  # ============================================================================
  # Backend API & WebSocket Service (Node.js 20 LTS + Express)
  # ============================================================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: primeestate-backend:latest
    container_name: primeestate-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    environment:
      - PORT=5000
      - NODE_ENV=production
    networks:
      - primeestate-network
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:5000/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 15s

  # ============================================================================
  # Frontend Web & Reverse Proxy Service (React 18 + Vite + Nginx Alpine)
  # ============================================================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: primeestate-frontend:latest
    container_name: primeestate-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - primeestate-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:80/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 10s

# ==============================================================================
# Isolated Internal Bridge Network
# ==============================================================================
networks:
  primeestate-network:
    driver: bridge
    name: primeestate-network
```

---

### 4.5 Docker Ignore Optimization (`.dockerignore`)
Prevents bloating Docker build contexts and avoids leaking local secrets or dependencies into container images:

```text
# Git version control
.git
.gitignore

# Dependencies (containers install their own Linux-compatible dependencies)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local environment variables & secrets (NEVER bake into image layers)
.env
.env.*
*.local

# Build output
dist/
build/

# IDE & Editor files
.vscode/
.idea/
*.swp
*.swo

# Operating System files
.DS_Store
Thumbs.db

# Documentation & tests
*.md
coverage/
```

---

## 5. Step-by-Step Execution Guide

### Step 1: Ensure Prerequisites
Verify that Docker Engine and Docker Compose are installed and operational:
```bash
docker --version
docker compose version
```

### Step 2: Validate Environment Secrets
Ensure `backend/.env` exists locally with your MongoDB Atlas connection string and JWT secret:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/primeestate?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

### Step 3: Build Container Images
Build the production images using Docker Compose:
```bash
docker compose build
```
*Output confirms both images compiled without errors:*
- `primeestate-backend:latest` (Content Size: **63.6 MB**)
- `primeestate-frontend:latest` (Content Size: **26.5 MB**)

### Step 4: Launch the Multi-Container Stack
Start the application in detached mode:
```bash
docker compose up -d
```

### Step 5: Verify Service Health & Container Status
Check that both containers are running and in a `(healthy)` state:
```bash
docker compose ps
```
*Expected Output:*
```text
NAME                   IMAGE                         STATUS                   PORTS
primeestate-backend    primeestate-backend:latest    Up 4 minutes (healthy)   0.0.0.0:5000->5000/tcp
primeestate-frontend   primeestate-frontend:latest   Up 2 minutes (healthy)   0.0.0.0:3000->80/tcp
```

### Step 6: View Live Container Logs
Stream real-time logs from both services:
```bash
docker compose logs -f
```

### Step 7: Teardown the Stack
When testing is complete, gracefully shut down and remove containers and networks:
```bash
docker compose down
```

---

## 6. Testing & Live Verification Results

The containerized PrimeEstate stack was subjected to rigorous live verification across all layers:

### 6.1 Backend API & Database Connectivity
```bash
curl -i http://localhost:5000/api/health
```
**HTTP Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "success": true,
  "message": "PrimeEstate API is operational",
  "database": "connected",
  "databaseState": 1,
  "timestamp": "2026-11-19T19:40:24.492Z"
}
```
*Result:* **PASS**. Express server successfully established connection with MongoDB Atlas replica set over TLS.

### 6.2 Frontend SPA Routing & Direct URL Deep-linking
```bash
curl -i http://localhost:3000/listings
```
**HTTP Response:**
```text
HTTP/1.1 200 OK
Server: nginx/1.27.4
Content-Type: text/html

<!doctype html>
<html lang="en">
  <head>
    <title>PrimeEstate - Luxury Real Estate Platform</title>
```
*Result:* **PASS**. Nginx `try_files` rule correctly redirected the deep-link route `/listings` to `/index.html` with an HTTP 200 status, preventing 404 errors.

### 6.3 Secure Authentication & JWT Generation
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@primeestate.com","password":"Password123!"}'
```
**HTTP Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673cf824d5e89a9f2420f1a1",
    "name": "Priya Sharma",
    "email": "agent@primeestate.com",
    "role": "Agent"
  }
}
```
*Result:* **PASS**. Reverse proxy correctly forwarded payload to backend; bcrypt validated password hash; signed JWT returned.

### 6.4 Property Catalog Query via Nginx Reverse Proxy
```bash
curl http://localhost:3000/api/properties
```
*Result:* **PASS**. Returned all 8 active luxury property listings stored in MongoDB Atlas via Nginx on port 3000.

### 6.5 Authenticated CRUD Operation Inside Container
- Created new test property `Container Test Villa` via authenticated `POST /api/properties`.
- Queried newly created record by ID `6aff5208cb7ca0e7c0988078`.
- Deleted test property via authenticated `DELETE /api/properties/6aff5208cb7ca0e7c0988078`.
*Result:* **PASS**. Full CRUD lifecycle executed smoothly through containerized reverse proxy.

### 6.6 Real-Time WebSocket Handshake
Executed WebSocket handshake test directly through Nginx port 3000:
```text
Connecting to: ws://localhost:3000/socket.io/?EIO=4&transport=websocket
WebSocket connection opened successfully!
Received packet: 0{"sid":"fP_iK93_X...","upgrades":[],"pingInterval":25000,"pingTimeout":20000}
Sent ping (packet 2)
Received pong (packet 3)
```
*Result:* **PASS**. Nginx upgraded HTTP connection to WebSocket, connecting client to Socket.IO engine inside backend container.

---

## 7. Practical Lab File Screenshot Checklist

When compiling your semester lab manual, capture and include the following 6 screenshots:

1. **Screenshot 1 – Docker Build Output:**
   - Command prompt showing `docker compose build` completing both stages for `primeestate-backend` and `primeestate-frontend`.
2. **Screenshot 2 – Docker Desktop Dashboard:**
   - Docker Desktop GUI showing the `primeestate` compose project with both `primeestate-backend` and `primeestate-frontend` showing green **Running** and **(healthy)** badges.
3. **Screenshot 3 – Docker CLI Verification (`docker compose ps` & `docker images`):**
   - Terminal showing `docker compose ps` with status `Up (healthy)` and `docker images` highlighting the small image sizes (63.6 MB backend, 26.5 MB frontend).
4. **Screenshot 4 – Backend API Health Endpoint:**
   - Browser or Postman displaying `http://localhost:5000/api/health` returning `{"database": "connected", "databaseState": 1}`.
5. **Screenshot 5 – PrimeEstate Web Application via Nginx on Port 3000:**
   - Browser showing `http://localhost:3000` with the luxury real estate landing page and property cards fully rendered.
6. **Screenshot 6 – Real-Time Agent Dashboard & Notifications:**
   - Browser showing `http://localhost:3000/dashboard` logged in as an Agent, with real-time WebSocket connection indicator active.

---

## 8. Viva Voce Questions & Answers

### Q1: What is the primary difference between a Docker image and a Docker container?
**Answer:** A Docker image is a read-only, immutable template containing application code, runtime, libraries, and instructions for creating a container. A Docker container is a runnable, isolated instance of an image with a thin read-write container layer on top.

### Q2: What is a Multi-Stage Docker build, and why did you use it for the React frontend?
**Answer:** A Multi-Stage build uses multiple `FROM` instructions in a single Dockerfile. The first stage (`builder`) uses Node.js to install dependencies and compile the React/Vite app into static assets. The second stage (`runner`) uses Nginx Alpine and copies *only* the compiled static files (`/app/dist`), discarding Node.js, `npm`, and `node_modules`. This reduced our frontend image size from over 800 MB to just **26.5 MB**, maximizing performance and security.

### Q3: Why is Nginx used as a reverse proxy in front of the backend instead of having the browser call port 5000 directly?
**Answer:** 
1. **Single-Origin Architecture:** Browser connects only to port 3000. Nginx proxies `/api` and `/socket.io` to the backend on port 5000, eliminating CORS issues.
2. **SPA Routing:** Nginx handles client-side routing via `try_files $uri $uri/ /index.html;`, preventing 404 errors when users refresh deep links.
3. **Performance & Security:** Nginx provides Gzip compression, static asset caching, and protects the Node.js application from direct internet exposure.

### Q4: How does Nginx handle real-time Socket.IO WebSocket traffic?
**Answer:** In `nginx.conf`, the `/socket.io/` block sets:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```
This instructs Nginx to pass HTTP 101 Switching Protocols headers between the browser and Node.js server, converting standard HTTP connections into persistent, full-duplex TCP WebSocket connections.

### Q5: How do the containers communicate with each other inside Docker Compose?
**Answer:** Docker Compose automatically creates a user-defined bridge network (`primeestate-network`) with embedded DNS. Containers resolve each other using their service names. For instance, Nginx reaches the Express backend using `http://backend:5000` rather than hardcoded IP addresses.

### Q6: Why did you switch to a non-root user (`USER node`) in the backend Dockerfile?
**Answer:** By default, Docker containers run as `root`. If an attacker exploits an application vulnerability and achieves remote code execution, they would have root privileges inside the container, increasing the risk of container escape. Switching to the built-in `node` user implements the Principle of Least Privilege.

### Q7: What is the purpose of Docker Health Checks?
**Answer:** Health checks allow the Docker engine to monitor whether an application is genuinely operational, not just whether the container process is running. In our project:
- Backend runs `node -e "fetch('http://localhost:5000/api/health')..."` to verify Express and MongoDB Atlas connectivity.
- Compose uses `depends_on: backend: condition: service_healthy` so the frontend Nginx proxy will not launch until the backend is fully connected to the database.

### Q8: Why are `.dockerignore` files important?
**Answer:** `.dockerignore` prevents unnecessary or sensitive files from being copied into the Docker build context. This speeds up build times by excluding `node_modules` and prevents critical security leaks by blocking `.env` files from being baked into public image layers.

### Q9: How are environment variables and database credentials passed securely into the containers?
**Answer:** Sensitive credentials (`MONGO_URI`, `JWT_SECRET`) are never hardcoded in Dockerfiles or committed to GitHub. Docker Compose reads them at runtime from the local `backend/.env` file via `env_file: ./backend/.env` and injects them as OS environment variables into the container environment.

### Q10: What is Docker layer caching, and how is it optimized in your Dockerfiles?
**Answer:** Docker caches the result of each instruction as an image layer. If an instruction and its files have not changed, Docker reuses the cached layer. In both our Dockerfiles, we copy `package*.json` and run `npm ci` *before* copying the source code (`COPY . .`). This ensures that changes to source code do not trigger a slow re-installation of npm packages.

### Q11: What command would you use to view logs of a specific running container?
**Answer:** `docker compose logs -f backend` or `docker logs -f primeestate-backend`. The `-f` flag streams new log entries in real-time.

### Q12: How does Docker differ from Kubernetes?
**Answer:** Docker is a container runtime used to build and run individual containers on a single host. Kubernetes is a container orchestration platform designed to automate deployment, scaling, load balancing, and failover of containerized applications across a cluster of multiple physical or virtual nodes.

---

## 9. Conclusion
Experiment 10 successfully containerized and orchestrated the complete full-stack **PrimeEstate** platform using **Docker** and **Docker Compose**. By employing Alpine-based multi-stage builds, non-root security principles, Nginx reverse proxy routing, and dependency-aware health checks, the application achieved complete environment parity, sub-30 MB frontend footprint, seamless real-time WebSocket communication, and robust cloud connectivity with MongoDB Atlas.
