# =============================================================================
# PrimeEstate Backend - Production Dockerfile
# Multi-stage / lightweight official Node.js 20 LTS Alpine image
# =============================================================================
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Configure production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies first (layer caching optimization)
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts || npm install --production

# Copy application source code
COPY . .

# Ensure non-root node user owns all application files
RUN chown -R node:node /app

# Switch to non-root user for security best practices
USER node

# Expose backend REST API & WebSocket port
EXPOSE 5000

# Health check using Node.js native fetch
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the Node.js Express server
CMD ["node", "server.js"]
