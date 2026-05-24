import { Server, Socket } from 'socket.io';

interface UserCursor {
  userId: string;
  name: string;
  x: number;
  y: number;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a Project room
    socket.on('project:join', ({ projectId, userId, name }) => {
      socket.join(projectId);
      console.log(`User ${name} joined project: ${projectId}`);
      
      // Notify other members of user appearance
      socket.to(projectId).emit('user:joined', { userId, name, socketId: socket.id });
    });

    // Leave a Project room
    socket.on('project:leave', ({ projectId, userId, name }) => {
      socket.leave(projectId);
      console.log(`User ${name} left project: ${projectId}`);
      socket.to(projectId).emit('user:left', { userId, name, socketId: socket.id });
    });

    // Sync task movements across boards
    socket.on('task:move', ({ projectId, taskId, sourceStatus, destinationStatus, newOrder }) => {
      socket.to(projectId).emit('task:moved', {
        taskId,
        sourceStatus,
        destinationStatus,
        newOrder
      });
    });

    // Sync active typing indicators inside comments
    socket.on('comment:typing', ({ projectId, taskId, userName, isTyping }) => {
      socket.to(projectId).emit('comment:typed', {
        taskId,
        userName,
        isTyping
      });
    });

    // Real-time cursor movement synchronization
    socket.on('presence:cursor', ({ projectId, userId, name, x, y }) => {
      socket.to(projectId).emit('presence:cursor_moved', {
        userId,
        name,
        x,
        y
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
