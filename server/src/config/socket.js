const { Server } = require('socket.io');
const env = require('./env');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('subscribe_execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        console.log(`[Socket.IO] ${socket.id} subscribed to execution:${executionId}`);
      }
    });

    socket.on('unsubscribe_execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO Warning] Socket.io not initialized yet.');
  }
  return io;
};

const emitExecutionEvent = (executionId, data) => {
  if (io) {
    io.to(`execution:${executionId}`).emit('agent_event', data);
    io.emit('global_execution_event', data);
  }
};

const emitNotification = (userId, notification) => {
  if (io) {
    io.emit(`notification:${userId}`, notification);
    io.emit('global_notification', notification);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent,
  emitNotification,
};
