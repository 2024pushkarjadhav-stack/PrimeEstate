const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Initialize Socket.IO with HTTP Server
 * @param {import('http').Server} server 
 */
const { isOriginAllowed } = require('./config/cors');

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS not allowed for socket connection'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Authentication Middleware for incoming socket connections
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/, '') ||
      socket.handshake.query?.token;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'primeestate_super_secret_jwt_key_2026_secure'
        );
        socket.user = decoded;
      } catch (err) {
        console.warn(`[Socket.IO Auth] Handshake token verification failed: ${err.message}`);
        // Allow socket connection as guest/public viewer
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    const clientId = socket.id;
    const userRole = socket.user?.role || 'Guest';
    const userName = socket.user?.name || 'Anonymous';
    console.log(`[Socket.IO] Connected: ${clientId} (${userName} - ${userRole})`);

    // Automatically join user-specific private room if authenticated
    if (socket.user?.id) {
      const userRoom = `user_${socket.user.id}`;
      socket.join(userRoom);
      console.log(`[Socket.IO] ${clientId} joined private room: ${userRoom}`);
    }

    // Automatically join role-specific room (e.g. role_Agent or role_Buyer)
    if (socket.user?.role) {
      const roleRoom = `role_${socket.user.role}`;
      socket.join(roleRoom);
      console.log(`[Socket.IO] ${clientId} joined role room: ${roleRoom}`);
    }

    // Ping / heartbeat event from client
    socket.on('ping', () => {
      socket.emit('pong', {
        serverTime: new Date().toISOString(),
        status: 'online',
        socketId: socket.id,
      });
    });

    // Custom subscribe room if client wants to monitor a specific property
    socket.on('subscribe:property', (propertyId) => {
      if (propertyId) {
        socket.join(`property_${propertyId}`);
      }
    });

    socket.on('unsubscribe:property', (propertyId) => {
      if (propertyId) {
        socket.leave(`property_${propertyId}`);
      }
    });

    // Real-Time Event Relays
    socket.on('property:broadcast', (data) => {
      io.emit('property:created', data);
      io.emit('notification:new', {
        id: `notif_${Date.now()}`,
        type: 'property',
        title: 'New Luxury Property Listed',
        message: `"${data.title}" in ${data.location} was just listed!`,
        propertyId: data._id,
        timestamp: new Date().toISOString(),
        read: false,
      });
    });

    socket.on('appointment:notify', (data) => {
      const notif = {
        id: `notif_${Date.now()}`,
        type: 'appointment',
        title: 'New Site Visit Booked',
        message: `${data.customerName || 'Customer'} booked a visit for "${data.propertyTitle || 'Property'}".`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      if (data.agentId) {
        io.to(`user_${data.agentId}`).emit('appointment:created', data);
        io.to(`user_${data.agentId}`).emit('notification:new', notif);
      }
      io.to('role_Agent').emit('appointment:created', data);
      io.to('role_Agent').emit('notification:new', notif);
    });

    socket.on('status:notify', (data) => {
      const notif = {
        id: `notif_${Date.now()}`,
        type: 'appointment_update',
        title: `Site Visit ${data.status || 'Updated'}`,
        message: `Your visit for "${data.propertyTitle || 'Property'}" is now marked as ${data.status}.`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      if (data.customerId) {
        io.to(`user_${data.customerId}`).emit('appointment:updated', data);
        io.to(`user_${data.customerId}`).emit('notification:new', notif);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected: ${clientId} (${reason})`);
    });
  });

  return io;
}

/**
 * Get active Socket.IO server instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO is not initialized. Call initSocket(server) first.');
  }
  return io;
}

/**
 * Broadcast event to all connected clients
 */
function emitToAll(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Emit event to a specific authenticated user's private room
 */
function emitToUser(userId, event, data) {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
}

/**
 * Emit event to a specific role group (e.g. 'Agent' or 'Buyer')
 */
function emitToRole(role, event, data) {
  if (io && role) {
    io.to(`role_${role}`).emit(event, data);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitToAll,
  emitToUser,
  emitToRole,
};
