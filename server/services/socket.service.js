/**
 * Socket.io Service
 *
 * Handles real-time WebSocket connections for notifications
 * - Authenticates users via JWT
 * - Tracks connected users
 * - Provides methods to emit events to specific users or all users
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

// Track connected users: { oduserId: Set of socketIds }
const connectedUsers = new Map();

let io = null;

/**
 * Initialize Socket.io with the server instance
 */
const initialize = (socketIo) => {
    io = socketIo;

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return next(new Error('Invalid token'));
            }

            const user = await User.findById(decoded.id).select('_id name role');
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = user._id.toString();
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

    // Handle connections
    io.on('connection', (socket) => {
        const userId = socket.userId;

        // Add user to connected users
        if (!connectedUsers.has(userId)) {
            connectedUsers.set(userId, new Set());
        }
        connectedUsers.get(userId).add(socket.id);

        console.log(`User connected: ${userId} (socket: ${socket.id})`);

        // Handle disconnection
        socket.on('disconnect', () => {
            const userSockets = connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    connectedUsers.delete(userId);
                }
            }
            console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
        });
    });

    console.log('Socket.io initialized');
};

/**
 * Emit event to a specific user
 * @param {string} userId - User ID to send to
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const emitToUser = (userId, event, data) => {
    if (!io) return;

    const userIdStr = userId.toString();
    const userSockets = connectedUsers.get(userIdStr);

    if (userSockets && userSockets.size > 0) {
        userSockets.forEach((socketId) => {
            io.to(socketId).emit(event, data);
        });
        return true;
    }
    return false;
};

/**
 * Emit event to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const emitToUsers = (userIds, event, data) => {
    if (!io) return;

    userIds.forEach((userId) => {
        emitToUser(userId, event, data);
    });
};

/**
 * Emit event to all connected users
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const emitToAll = (event, data) => {
    if (!io) return;
    io.emit(event, data);
};

/**
 * Check if user is online
 * @param {string} userId - User ID to check
 */
const isUserOnline = (userId) => {
    return connectedUsers.has(userId.toString());
};

/**
 * Get count of connected users
 */
const getConnectedUsersCount = () => {
    return connectedUsers.size;
};

module.exports = {
    initialize,
    emitToUser,
    emitToUsers,
    emitToAll,
    isUserOnline,
    getConnectedUsersCount,
};
