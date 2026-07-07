import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react';
import { UserRole, useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { chatApi, ChatMessage, ChatParticipant, ChatThread } from '../../api/chatApi';
import { getChatSocket } from '../../api/chatSocket';
import { entrepreneurApi } from '../../api/entrepreneurApi';

interface ContactItem {
  id: string;
  name: string;
  role: UserRole;
  type: 'direct' | 'role' | 'idea';
  ideaId?: string;
  ideaTitle?: string;
}

interface ChatWidgetProps {
  currentUserRole: UserRole;
}

export const ChatWidget = ({ currentUserRole }: ChatWidgetProps) => {
  const { user, users } = useAuth();
  const { activeContact, shouldOpenChat, resetChat } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ideaContacts, setIdeaContacts] = useState<ContactItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const joinedThreadId = useRef<string | null>(null);

  const currentUser = useMemo<ChatParticipant | null>(() => {
    if (!user) return null;
    return { id: user.id, name: user.name, role: user.role };
  }, [user]);

  const directContacts = useMemo(() => {
    if (!user) return [] as ContactItem[];
    return users
      .filter((candidate) => candidate.id !== user.id)
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        role: candidate.role,
        type: 'direct' as const,
      }));
  }, [user, users]);

  const roleContacts = useMemo(() => {
    const roles: UserRole[] = ['Entrepreneur', 'Supplier', 'Investor', 'Admin'];
    return roles.map((role) => ({
      id: `role-${role}`,
      name: `${role} Room`,
      role,
      type: 'role' as const,
    }));
  }, []);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    entrepreneurApi
      .getIdeas()
      .then((ideas) => {
        if (!isMounted) return;
        const approvedIdeas = ideas.filter((idea: any) => idea.status === 'Approved');
        setIdeaContacts(
          approvedIdeas.slice(0, 12).map((idea: any) => ({
            id: `idea-${idea.id}`,
            name: idea.title,
            role: 'Investor',
            type: 'idea' as const,
            ideaId: idea.id,
            ideaTitle: idea.title,
          }))
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setIdeaContacts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!currentUser) return;
    const socket = getChatSocket(currentUser);
    const handleNewMessage = (message: ChatMessage) => {
      if (!selectedThread || message.threadId !== selectedThread.id) return;
      setMessages((prev) => [...prev, message]);
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [currentUser, selectedThread]);

  useEffect(() => {
    if (shouldOpenChat && activeContact) {
      setIsOpen(true);
      handleOpenDirect(activeContact);
    }
  }, [shouldOpenChat, activeContact]);

  const handleOpenDirect = async (contact: { id: string; name: string; role: UserRole }) => {
    if (!currentUser) return;
    try {
      const thread = await chatApi.createThread({
        type: 'direct',
        participants: [currentUser, { id: contact.id, name: contact.name, role: contact.role }],
      });
      openThread(thread);
    } catch (err) {
      setError('Unable to open chat.');
    }
  };

  const handleOpenContact = async (contact: ContactItem) => {
    if (!currentUser) return;
    setError(null);
    try {
      let thread: ChatThread;
      if (contact.type === 'direct') {
        thread = await chatApi.createThread({
          type: 'direct',
          participants: [currentUser, { id: contact.id, name: contact.name, role: contact.role }],
        });
      } else if (contact.type === 'role') {
        thread = await chatApi.createThread({
          type: 'role',
          role: contact.role,
          title: contact.name,
        });
      } else {
        thread = await chatApi.createThread({
          type: 'idea',
          ideaId: contact.ideaId,
          ideaTitle: contact.ideaTitle,
        });
      }
      openThread(thread);
    } catch (err) {
      setError('Unable to open chat.');
    }
  };

  const openThread = async (thread: ChatThread) => {
    if (!currentUser) return;
    setSelectedThread(thread);
    setIsLoadingMessages(true);
    try {
      const threadMessages = await chatApi.getMessages(thread.id);
      setMessages(threadMessages);
    } catch (err) {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }

    const socket = getChatSocket(currentUser);
    if (joinedThreadId.current && joinedThreadId.current !== thread.id) {
      socket.emit('thread:leave', { threadId: joinedThreadId.current });
    }
    socket.emit('thread:join', { threadId: thread.id });
    joinedThreadId.current = thread.id;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !currentUser) return;
    const content = newMessage.trim();
    setNewMessage('');
    try {
      await chatApi.sendMessage({
        threadId: selectedThread.id,
        content,
      });
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setSelectedThread(null);
    setMessages([]);
    resetChat();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#0066cc] text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-[#004080] transition z-50"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 ${
        isMinimized ? 'w-72 sm:w-80' : 'w-full sm:w-96 h-[500px] max-w-[calc(100vw-2rem)]'
      } flex flex-col`}
    >
      <div className="bg-gradient-to-r from-[#0066cc] to-[#008b8b] text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Messages</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!selectedThread ? (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase">Role Rooms</div>
              {roleContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleOpenContact(contact)}
                  className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0066cc] text-white rounded-full flex items-center justify-center">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.role}</div>
                    </div>
                  </div>
                </button>
              ))}

              <div className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase">Direct Messages</div>
              {directContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleOpenContact(contact)}
                  className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0066cc] text-white rounded-full flex items-center justify-center">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.role}</div>
                    </div>
                  </div>
                </button>
              ))}

              {currentUserRole !== 'Supplier' && (
                <>
                  <div className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase">Idea Threads</div>
                  {ideaContacts.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No idea threads available.</div>
                  )}
                  {ideaContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleOpenContact(contact)}
                      className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0066cc] text-white rounded-full flex items-center justify-center">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{contact.name}</div>
                          <div className="text-xs text-gray-500">Idea Thread</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="text-[#0066cc] hover:underline text-sm"
                >
                  ← Back
                </button>
                <div className="font-semibold">{selectedThread.title || 'Chat'}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMessages && (
                  <div className="text-sm text-gray-500">Loading messages...</div>
                )}
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                {!isLoadingMessages && messages.length === 0 && (
                  <div className="text-sm text-gray-500">No messages yet.</div>
                )}
                {messages.map((message) => {
                  const isOwn = message.sender?.id === currentUser?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn ? 'bg-[#0066cc] text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyPress={(event) => event.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-[#0066cc] text-white p-2 rounded-lg hover:bg-[#004080] transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const formatTime = (dateValue: string | Date) => {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
