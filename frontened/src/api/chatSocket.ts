import { io, Socket } from "socket.io-client";
import { ChatParticipant } from "./chatApi";

const SOCKET_URL = (import.meta as any).env.VITE_SOCKET_URL || (import.meta as any).env.VITE_API_BASE || "http://localhost:4000";

let socket: Socket | null = null;

export const getChatSocket = (user: ChatParticipant) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { user },
    });
  } else {
    socket.auth = { user };
    if (!socket.connected) {
      socket.connect();
    }
  }
  return socket;
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
