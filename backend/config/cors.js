/**
 * PrimeEstate - Production CORS Configuration
 * Allows local development, configured CLIENT_URL, and dynamic Vercel / Render domains.
 */

const getNormalizedOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  if (process.env.CLIENT_URL) {
    // Support comma-separated origins if multiple are specified
    const clientUrls = process.env.CLIENT_URL.split(',').map((url) =>
      url.trim().replace(/\/+$/, '')
    );
    return [...defaults, ...clientUrls];
  }

  return defaults;
};

const isOriginAllowed = (origin) => {
  // Allow server-to-server, curl, Postman, or requests without Origin header
  if (!origin) return true;

  const cleanOrigin = origin.replace(/\/+$/, '');
  const allowed = getNormalizedOrigins();

  // 1. Exact match with configured origins
  if (allowed.includes(cleanOrigin)) {
    return true;
  }

  // 2. Allow any Vercel production or preview deployment (*.vercel.app)
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(cleanOrigin)) {
    return true;
  }

  // 3. Allow Render deployment domains (*.onrender.com)
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.onrender\.com$/.test(cleanOrigin)) {
    return true;
  }

  // 4. In development mode, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = {
  corsOptions,
  isOriginAllowed,
};
