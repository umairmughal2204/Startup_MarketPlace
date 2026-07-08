import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Send, Minimize2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
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

// Consistent per-role color coding used across avatars, badges and message labels so
// it's immediately visually clear who a message/contact/thread belongs to (Entrepreneur
// vs Supplier vs Investor vs Admin) without having to read the role text every time.
const ROLE_THEME: Record<string, { avatar: string; badge: string }> = {
  Entrepreneur: { avatar: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700' },
  Supplier: { avatar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  Investor: { avatar: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  Admin: { avatar: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700' },
};
const getRoleTheme = (role?: string) =>
  ROLE_THEME[role || ''] || { avatar: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700' };

// Direct threads are stored with a combined title ("Alice & Bob"), which doesn't tell
// either viewer "who is this conversation with" at a glance. This derives what should
// actually be shown to the current viewer for any thread type.
const getThreadDisplay = (thread: ChatThread, selfId?: string) => {
  if (thread.type === 'direct') {
    const other = thread.participants?.find((p) => p.id !== selfId);
    return {
      name: other?.name || thread.title || 'Conversation',
      role: other?.role,
      kind: 'Direct Message',
      description: 'Private conversation, only you two can see it',
    };
  }
  if (thread.type === 'role') {
    return {
      name: thread.title || `${thread.role} Room`,
      role: thread.role,
      kind: 'Role Room',
      description: `Shared room — visible to everyone with the ${thread.role} role`,
    };
  }
  return {
    name: thread.ideaTitle || thread.title || 'Idea Discussion',
    role: undefined,
    kind: 'Idea Discussion',
    description: 'Discussion thread linked to this idea submission',
  };
};

export const ChatWidget = ({ currentUserRole }: ChatWidgetProps) => {
  const { user } = useAuth();
  const { activeContact, shouldOpenChat, resetChat } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ideaContacts, setIdeaContacts] = useState<ContactItem[]>([]);
  const [directContacts, setDirectContacts] = useState<ContactItem[]>([]);
  const [conversations, setConversations] = useState<ChatThread[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [unreadThreadIds, setUnreadThreadIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const joinedThreadId = useRef<string | null>(null);
  const selectedThreadRef = useRef<ChatThread | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const currentUser = useMemo<ChatParticipant | null>(() => {
    if (!user) return null;
    return { id: user.id, name: user.name, role: user.role };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    chatApi
      .getContacts()
      .then((contacts) => {
        if (!isMounted) return;
        setDirectContacts(
          contacts.map((contact) => ({
            id: contact.id,
            name: contact.name,
            role: contact.role as UserRole,
            type: 'direct' as const,
          }))
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setDirectContacts([]);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const refreshConversations = () => {
    if (!user) return;
    setIsLoadingConversations(true);
    chatApi
      .getThreads(user.id, user.role)
      .then((threads) => setConversations(threads))
      .catch(() => setConversations([]))
      .finally(() => setIsLoadingConversations(false));
  };

  useEffect(() => {
    if (isOpen) refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const roleContacts = useMemo(() => {
    const allRoles: UserRole[] = ['Entrepreneur', 'Supplier', 'Investor', 'Admin'];
    // A role room only makes sense for people who share that role — a Supplier can never
    // actually read or post in the Admin Room (the backend rejects it), so showing that
    // button to them was just a dead end. Admin can still see/join every room for oversight.
    const visibleRoles = currentUserRole === 'Admin' ? allRoles : [currentUserRole];
    return visibleRoles.map((role) => ({
      id: `role-${role}`,
      name: `${role} Room`,
      role,
      type: 'role' as const,
    }));
  }, [currentUserRole]);

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
    selectedThreadRef.current = selectedThread;
  }, [selectedThread]);

  // Keep the message list pinned to the latest message — without this, opening a
  // thread or receiving a new message left the view sitting wherever the scroll
  // container happened to be, which felt broken rather than like a real chat app.
  useEffect(() => {
    if (!selectedThread || isLoadingMessages) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, selectedThread, isLoadingMessages]);

  // Jump straight into typing once a conversation is open, like every other chat app.
  useEffect(() => {
    if (selectedThread && !isLoadingMessages) {
      messageInputRef.current?.focus();
    }
  }, [selectedThread, isLoadingMessages]);

  useEffect(() => {
    if (!currentUser) return;
    const socket = getChatSocket(currentUser);
    const handleNewMessage = (message: ChatMessage) => {
      const isForOpenThread = selectedThreadRef.current?.id === message.threadId;
      if (isForOpenThread) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }
      if (message.sender?.id !== currentUser.id && !isForOpenThread) {
        setUnreadThreadIds((prev) => new Set(prev).add(message.threadId));
        toast(`New message from ${message.sender?.name || 'someone'}`, {
          description: message.content,
        });
      }
      // Keep the conversation list's last-message preview and ordering current.
      refreshConversations();
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [currentUser]);

  useEffect(() => {
    if (shouldOpenChat && activeContact) {
      setIsOpen(true);
      handleOpenDirect(activeContact);
    }
  }, [shouldOpenChat, activeContact]);

  const handleOpenDirect = async (contact: {
    id: string;
    name: string;
    role: UserRole;
    productId?: string;
    productTitle?: string;
  }) => {
    if (!currentUser) return;
    try {
      const thread = await chatApi.createThread({
        type: 'direct',
        participants: [currentUser, { id: contact.id, name: contact.name, role: contact.role }],
        productId: contact.productId,
        productTitle: contact.productTitle,
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
    setUnreadThreadIds((prev) => {
      if (!prev.has(thread.id)) return prev;
      const next = new Set(prev);
      next.delete(thread.id);
      return next;
    });
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
    refreshConversations();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !currentUser || isSending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setError(null);
    setIsSending(true);
    try {
      const sent = await chatApi.sendMessage({
        threadId: selectedThread.id,
        content,
      });
      // Append immediately rather than waiting for the socket echo — the socket
      // handler dedupes by id, so this is safe even if the echo also arrives.
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      refreshConversations();
    } catch (err) {
      setNewMessage(content);
      setError('Failed to send message.');
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      messageInputRef.current?.focus();
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
        {unreadThreadIds.size > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-[width] duration-200 ease-in-out ${
        isMinimized ? 'w-72 sm:w-80' : 'w-full sm:w-96 h-[500px] max-w-[calc(100vw-2rem)]'
      } flex flex-col`}
    >
      <div className="bg-gradient-to-r from-[#0066cc] to-[#008b8b] text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Messages</span>
          {unreadThreadIds.size > 0 && (
            <span className="w-2 h-2 bg-red-400 rounded-full" title="Unread messages" />
          )}
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
              {isLoadingConversations && <ConversationsSkeleton />}
              {!isLoadingConversations && conversations.length === 0 && (
                <div className="px-4 pt-4 text-sm text-gray-500">
                  No conversations yet — start one below.
                </div>
              )}
              {conversations.length > 0 && (
                <>
                  <div className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase">Conversations</div>
                  {conversations.map((thread) => {
                    const isUnread = unreadThreadIds.has(thread.id);
                    const display = getThreadDisplay(thread, currentUser?.id);
                    const theme = getRoleTheme(display.role);
                    const lastMessage = thread.lastMessage;
                    const lastMessagePrefix =
                      lastMessage?.senderId && lastMessage.senderId === currentUser?.id ? 'You: ' : '';
                    return (
                      <button
                        key={thread.id}
                        onClick={() => openThread(thread)}
                        className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${theme.avatar} text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold`}
                          >
                            {display.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-sm truncate">{display.name}</div>
                              {display.role && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${theme.badge}`}>
                                  {display.role}
                                </span>
                              )}
                              {isUnread && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                              {thread.updatedAt && (
                                <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">
                                  {formatRelativeTime(thread.updatedAt)}
                                </span>
                              )}
                            </div>
                            {thread.productTitle && (
                              <div className="text-[11px] text-[#0066cc] truncate font-medium">
                                Re: {thread.productTitle}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 truncate">
                              {lastMessage?.content ? `${lastMessagePrefix}${lastMessage.content}` : 'No messages yet'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              <div className="px-4 pt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase">Role Rooms</div>
                <div className="text-[11px] text-gray-400">Broadcast rooms — everyone with that role sees them</div>
              </div>
              {roleContacts.map((contact) => {
                const theme = getRoleTheme(contact.role);
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleOpenContact(contact)}
                    className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${theme.avatar} text-white rounded-full flex items-center justify-center font-semibold`}>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{contact.name}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${theme.badge}`}>
                          {contact.role}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="px-4 pt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase">Direct Messages</div>
                <div className="text-[11px] text-gray-400">
                  {currentUserRole === 'Admin'
                    ? 'Message any user directly'
                    : 'People you’re connected with (Admin, plus anyone from a product, co-founder, or mentor conversation)'}
                </div>
              </div>
              {directContacts.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No contacts yet — connections show up here once you message a supplier, co-founder, or mentor.
                </div>
              )}
              {directContacts.map((contact) => {
                const theme = getRoleTheme(contact.role);
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleOpenContact(contact)}
                    className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${theme.avatar} text-white rounded-full flex items-center justify-center font-semibold`}>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{contact.name}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${theme.badge}`}>
                          {contact.role}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {currentUserRole !== 'Supplier' && (
                <>
                  <div className="px-4 pt-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Idea Threads</div>
                    <div className="text-[11px] text-gray-400">Discuss an approved idea with investors</div>
                  </div>
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
                        <div className="w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center font-semibold">
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
              {(() => {
                const display = getThreadDisplay(selectedThread, currentUser?.id);
                const theme = getRoleTheme(display.role);
                return (
                  <div className="border-b border-gray-200 bg-white">
                    <div className="p-3 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedThread(null)}
                        aria-label="Back to conversations"
                        title="Back to conversations"
                        className="p-1.5 -ml-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#0066cc] active:bg-gray-200 transition flex-shrink-0"
                      >
                        <ArrowLeft className="w-[18px] h-[18px]" />
                      </button>
                      <div className={`w-8 h-8 ${theme.avatar} text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
                        {display.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-sm truncate">{display.name}</div>
                          {display.role && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${theme.badge}`}>
                              {display.role}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">{display.description}</div>
                      </div>
                    </div>
                    {selectedThread.productTitle && (
                      <div className="mx-3 mb-2 -mt-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-xs text-[#0066cc] font-medium truncate">
                        📦 Regarding: {selectedThread.productTitle}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex-1 overflow-y-auto scroll-smooth p-4 space-y-3">
                {isLoadingMessages && <MessagesSkeleton />}
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                {!isLoadingMessages && messages.length === 0 && (
                  <div className="text-sm text-gray-500">No messages yet.</div>
                )}
                {messages.map((message, index) => {
                  const isOwn = message.sender?.id === currentUser?.id;
                  const theme = getRoleTheme(message.sender?.role);
                  // Only show the sender's name/role/avatar once per consecutive run of
                  // their messages (and always for the other person, so it's always
                  // clear "from where this msg comes" — is it the Entrepreneur, the
                  // Supplier, or someone else in a shared Role Room).
                  const prevMessage = messages[index - 1];
                  const showSenderInfo = !isOwn && prevMessage?.sender?.id !== message.sender?.id;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
                      {!isOwn && (
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 self-end ${
                            showSenderInfo ? theme.avatar : 'invisible'
                          }`}
                        >
                          {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="max-w-[70%]">
                        {showSenderInfo && (
                          <div className="flex items-center gap-1.5 mb-1 ml-1">
                            <span className="text-xs font-semibold text-gray-700">{message.sender?.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${theme.badge}`}>
                              {message.sender?.role}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            isOwn ? 'bg-[#0066cc] text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="bg-[#0066cc] text-white p-2 rounded-lg hover:bg-[#004080] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
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

// Used for conversation-list previews, where a plain HH:MM is misleading once the
// last message is more than a few hours old.
const formatRelativeTime = (dateValue: string | Date) => {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Placeholder rows shown while the conversation list is loading, so the widget never
// shows a jarring blank panel or plain "Loading..." text.
const ConversationsSkeleton = () => (
  <div className="p-4 space-y-4 animate-pulse">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/5" />
          <div className="h-2.5 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

// Placeholder chat bubbles shown while a thread's message history is loading,
// alternating sides so it reads as a real conversation, not a spinner.
const MessagesSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[
      { mine: false, width: 'w-40' },
      { mine: true, width: 'w-28' },
      { mine: false, width: 'w-52' },
      { mine: false, width: 'w-24' },
    ].map((bubble, i) => (
      <div key={i} className={`flex ${bubble.mine ? 'justify-end' : 'justify-start'} gap-2`}>
        {!bubble.mine && <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />}
        <div className={`h-10 rounded-lg bg-gray-200 ${bubble.width}`} />
      </div>
    ))}
  </div>
);
