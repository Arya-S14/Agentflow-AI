import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Agentflow Socket.IO Server');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Agentflow Socket.IO Server');
    });
  }

  return socket;
};
