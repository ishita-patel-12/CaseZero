import { io } from 'socket.io-client';

let socket = null;

function getServerUrl() {
  const envUrl = (import.meta.env.VITE_API || import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
  return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
}

export function getSocket() {
  if (!socket) {
    const serverUrl = getServerUrl();
    const token = localStorage.getItem('cz_token');

    socket = io(serverUrl, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

export function connectSocket(token) {
  const s = getSocket();
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
