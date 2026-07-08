const API_BASE = (import.meta as any).env.VITE_API_BASE || "http://localhost:4000";
import { getAuthHeaders } from './authHeaders';

export type ChatThreadType = "role" | "direct" | "idea";

export interface ChatParticipant {
  id: string;
  name: string;
  role: string;
}

export interface ChatThread {
  id: string;
  type: ChatThreadType;
  title?: string;
  role?: string;
  ideaId?: string;
  ideaTitle?: string;
  productId?: string;
  productTitle?: string;
  participantIds?: string[];
  participants?: ChatParticipant[];
  lastMessage?: {
    id?: string;
    content?: string;
    senderId?: string;
    senderName?: string;
    createdAt?: string;
  };
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: ChatParticipant;
  content: string;
  createdAt: string;
}

const mapThread = (thread: any): ChatThread => ({
  id: thread.id || thread._id,
  type: thread.type,
  title: thread.title,
  role: thread.role,
  ideaId: thread.ideaId,
  ideaTitle: thread.ideaTitle,
  productId: thread.productId,
  productTitle: thread.productTitle,
  participantIds: thread.participantIds,
  participants: thread.participants,
  lastMessage: thread.lastMessage,
  updatedAt: thread.updatedAt,
});

const mapMessage = (message: any): ChatMessage => ({
  id: message.id || message._id,
  threadId: message.threadId,
  sender: message.sender,
  content: message.content,
  createdAt: message.createdAt,
});

export const chatApi = {
  async getContacts(): Promise<ChatParticipant[]> {
    const res = await fetch(`${API_BASE}/api/chat/contacts`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch chat contacts");
    return (await res.json()) || [];
  },
  async getThreads(userId: string, role: string) {
    const params = new URLSearchParams({ userId, role });
    const res = await fetch(`${API_BASE}/api/chat/threads?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch chat threads");
    const data = await res.json();
    return (data || []).map(mapThread) as ChatThread[];
  },
  async createThread(payload: {
    type: ChatThreadType;
    role?: string;
    ideaId?: string;
    ideaTitle?: string;
    productId?: string;
    productTitle?: string;
    title?: string;
    participants?: ChatParticipant[];
  }) {
    const res = await fetch(`${API_BASE}/api/chat/threads`, {
      method: "POST",
      headers: getAuthHeaders("application/json"),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create chat thread");
    const data = await res.json();
    return mapThread(data);
  },
  async getMessages(threadId: string) {
    const params = new URLSearchParams({ threadId });
    const res = await fetch(`${API_BASE}/api/chat/messages?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    return (data || []).map(mapMessage) as ChatMessage[];
  },
  async sendMessage(payload: { threadId: string; content: string }) {
    const res = await fetch(`${API_BASE}/api/chat/messages`, {
      method: "POST",
      headers: getAuthHeaders("application/json"),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to send message");
    const data = await res.json();
    return mapMessage(data);
  },
};
