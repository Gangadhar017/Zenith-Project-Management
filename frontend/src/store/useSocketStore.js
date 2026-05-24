import { create } from "zustand";
import { io } from "socket.io-client";
import { useWorkspaceStore } from "./useWorkspaceStore";

const SOCKET_BASE = "http://localhost:8000";

export const useSocketStore = create((set, get) => {
  return {
    socket: null,
    activeUsers: [],
    userCursors: {},
    isTyping: {},

    initializeSocket: (projectId, userId, name) => {
      if (get().socket) return;

      const socketInstance = io(SOCKET_BASE);

      socketInstance.on("connect", () => {
        console.log("Connected to socket engine:", socketInstance.id);
        socketInstance.emit("project:join", { projectId, userId, name });
      });

      // Handle other users joining
      socketInstance.on(
        "user:joined",
        ({ userId: joinedId, name: joinedName }) => {
          set((state) => ({
            activeUsers: [
              ...state.activeUsers.filter((u) => u.userId !== joinedId),
              { userId: joinedId, name: joinedName },
            ],
          }));
        },
      );

      // Handle other users leaving
      socketInstance.on("user:left", ({ userId: leftId }) => {
        set((state) => ({
          activeUsers: state.activeUsers.filter((u) => u.userId !== leftId),
        }));
      });

      // Synchronize live drag-and-drop actions
      socketInstance.on(
        "task:moved",
        ({ taskId, sourceStatus, destinationStatus, newOrder }) => {
          useWorkspaceStore.getState().updateTaskOptimistic(taskId, {
            status: destinationStatus,
            order: newOrder,
          });
        },
      );

      // Synchronize live typing indicators
      socketInstance.on("comment:typed", ({ taskId, userName, isTyping }) => {
        set((state) => ({
          isTyping: {
            ...state.isTyping,
            [taskId]: { userName, isTyping },
          },
        }));
      });

      // Synchronize collaborator cursor movements
      socketInstance.on(
        "presence:cursor_moved",
        ({ userId: cursorUserId, name: cursorName, x, y }) => {
          set((state) => ({
            userCursors: {
              ...state.userCursors,
              [cursorUserId]: { name: cursorName, x, y },
            },
          }));
        },
      );

      set({ socket: socketInstance });
    },

    disconnectSocket: (projectId, userId, name) => {
      const { socket } = get();
      if (socket) {
        socket.emit("project:leave", { projectId, userId, name });
        socket.disconnect();
        set({ socket: null, activeUsers: [], userCursors: {}, isTyping: {} });
      }
    },

    emitTaskMove: (
      projectId,
      taskId,
      sourceStatus,
      destinationStatus,
      newOrder,
    ) => {
      const { socket } = get();
      if (socket) {
        socket.emit("task:move", {
          projectId,
          taskId,
          sourceStatus,
          destinationStatus,
          newOrder,
        });
      }
    },

    emitCursorMove: (projectId, userId, name, x, y) => {
      const { socket } = get();
      if (socket) {
        socket.emit("presence:cursor", {
          projectId,
          userId,
          name,
          x,
          y,
        });
      }
    },

    emitTyping: (projectId, taskId, userName, isTyping) => {
      const { socket } = get();
      if (socket) {
        socket.emit("comment:typing", {
          projectId,
          taskId,
          userName,
          isTyping,
        });
      }
    },
  };
});
