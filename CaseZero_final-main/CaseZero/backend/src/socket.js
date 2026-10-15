import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, Investigation } from './models/index.js';

let io = null;

// Track active sockets per room: investigationId -> Map(socketId -> { user, action })
const roomSockets = new Map();

export function initSocket(server, clientUrl) {
  io = new Server(server, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    socket.on('join_investigation', async ({ investigationId }) => {
      if (!investigationId) return;

      const roomName = `inv_${investigationId}`;
      socket.join(roomName);
      socket.currentInvestigationId = investigationId;

      if (!roomSockets.has(investigationId)) {
        roomSockets.set(investigationId, new Map());
      }
      roomSockets.get(investigationId).set(socket.id, {
        userId: user.id,
        username: user.username,
        currentAction: 'Connected to command center'
      });

      // Update participant in DB if not already present
      try {
        const inv = await Investigation.findById(investigationId);
        if (inv) {
          const exists = inv.participants.some(p => p.userId?.toString() === user.id);
          if (!exists) {
            inv.participants.push({
              userId: user.id,
              username: user.username,
              joinedAt: new Date(),
              ready: true,
              currentAction: 'Joined investigation'
            });
            await inv.save();
          }
        }
      } catch (e) {
        console.error('Error recording participant join:', e.message);
      }

      const activeMembers = Array.from(roomSockets.get(investigationId).values());
      io.to(roomName).emit('presence_sync', { members: activeMembers });
      io.to(roomName).emit('player_joined', {
        userId: user.id,
        username: user.username,
        members: activeMembers,
        message: `${user.username} joined the investigation room.`
      });
    });

    socket.on('presence_update', ({ investigationId, action }) => {
      const targetId = investigationId || socket.currentInvestigationId;
      if (!targetId || !roomSockets.has(targetId)) return;

      const userEntry = roomSockets.get(targetId).get(socket.id);
      if (userEntry) {
        userEntry.currentAction = action || 'Investigating';
        const activeMembers = Array.from(roomSockets.get(targetId).values());
        io.to(`inv_${targetId}`).emit('presence_sync', { members: activeMembers });
      }
    });

    socket.on('send_chat', async ({ investigationId, text }) => {
      const targetId = investigationId || socket.currentInvestigationId;
      if (!targetId || !text?.trim()) return;

      const msg = {
        senderId: user.id,
        senderName: user.username,
        text: text.trim().slice(0, 500),
        timestamp: new Date()
      };

      try {
        await Investigation.findByIdAndUpdate(targetId, {
          $push: { chat: msg }
        });
      } catch (err) {
        console.error('Error saving chat message:', err.message);
      }

      io.to(`inv_${targetId}`).emit('chat_message', msg);
    });

    socket.on('leave_investigation', ({ investigationId }) => {
      const targetId = investigationId || socket.currentInvestigationId;
      if (targetId && roomSockets.has(targetId)) {
        roomSockets.get(targetId).delete(socket.id);
        if (roomSockets.get(targetId).size === 0) {
          roomSockets.delete(targetId);
        } else {
          const activeMembers = Array.from(roomSockets.get(targetId).values());
          io.to(`inv_${targetId}`).emit('presence_sync', { members: activeMembers });
          io.to(`inv_${targetId}`).emit('player_left', {
            userId: user.id,
            username: user.username,
            members: activeMembers
          });
        }
        socket.leave(`inv_${targetId}`);
      }
    });

    socket.on('disconnect', () => {
      const targetId = socket.currentInvestigationId;
      if (targetId && roomSockets.has(targetId)) {
        roomSockets.get(targetId).delete(socket.id);
        if (roomSockets.get(targetId).size === 0) {
          roomSockets.delete(targetId);
        } else {
          const activeMembers = Array.from(roomSockets.get(targetId).values());
          io.to(`inv_${targetId}`).emit('presence_sync', { members: activeMembers });
          io.to(`inv_${targetId}`).emit('player_left', {
            userId: user.id,
            username: user.username,
            members: activeMembers
          });
        }
      }
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function broadcastToRoom(investigationId, eventName, payload) {
  if (io && investigationId) {
    io.to(`inv_${investigationId}`).emit(eventName, payload);
  }
}
