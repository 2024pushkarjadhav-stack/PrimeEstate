# =============================================================================
# PrimeEstate Frontend - Multi-Stage Production Dockerfile
# Stage 1: Build React/Vite SPA bundle
# Stage 2: Serve static build with Nginx Alpine
# =============================================================================

# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for dynamic API and WebSocket routing
ARG VITE_API_BASE_URL=/api
ARG VITE_SOCKET_URL=/

# Expose build args to Vite build environment
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Copy dependency definitions and install
COPY package*.json ./
RUN npm ci || npm install

# Copy application source code
COPY . .

# Compile optimized production bundle
RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:alpine

# Clean default Nginx web root
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration supporting SPA routing and reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check endpoint verification
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/health || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
