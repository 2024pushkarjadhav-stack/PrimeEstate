import { io } from 'socket.io-client';

const rawSocketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : null) ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : null) ||
  'http://localhost:5000';

const SOCKET_URL = rawSocketUrl.replace(/\/+$/, '');

let socket = null;
let connectionListeners = [];

/**
 * Initialize and retrieve the singleton Socket.IO connection
 * @param {string|null} token - Optional JWT token for authenticated sockets
 */
export function getSocket(token = null) {
  const authToken = token || localStorage.getItem('primeestate_token');

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: authToken,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO Client] Connected to ${SOCKET_URL} with socket ID: ${socket.id}`);
      notifyConnectionListeners(true);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO Client] Disconnected: ${reason}`);
      notifyConnectionListeners(false);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.IO Client] Connection error: ${error.message}`);
      notifyConnectionListeners(false);
    });
  } else if (authToken && socket.auth?.token !== authToken) {
    // Update auth token if user logged in
    socket.auth = { token: authToken };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }

  return socket;
}

/**
 * Disconnect socket on logout or cleanup
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    notifyConnectionListeners(false);
  }
}

/**
 * Check if socket is currently connected
 */
export function isSocketConnected() {
  return socket ? socket.connected : false;
}

/**
 * Subscribe to socket connection status changes
 */
export function onConnectionChange(callback) {
  connectionListeners.push(callback);
  if (socket) {
    callback(socket.connected);
  }
  return () => {
    connectionListeners = connectionListeners.filter((cb) => cb !== callback);
  };
}

function notifyConnectionListeners(status) {
  connectionListeners.forEach((cb) => {
    try {
      cb(status);
    } catch (e) {
      console.error(e);
    }
  });
}

export default {
  getSocket,
  disconnectSocket,
  isSocketConnected,
  onConnectionChange,
};
