import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react';
import { UserRole } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface Message {
  id: string;
  sender: string;
  senderRole: UserRole;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatWidgetProps {
  currentUserRole: UserRole;
}

export const ChatWidget = ({ currentUserRole }: ChatWidgetProps) => {
  const { activeContact, shouldOpenChat, resetChat } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'John Supplier',
      senderRole: 'Supplier',
      content: 'Hello! I can help you with your product needs.',
      timestamp: new Date(Date.now() - 3600000),
      isOwn: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Mock contacts based on role
  const getContacts = () => {
    const baseContacts = currentUserRole === 'Entrepreneur'
      ? [
          { id: '1', name: 'John Supplier', role: 'Supplier' as UserRole },
          { id: '2', name: 'Sarah Investor', role: 'Investor' as UserRole },
        ]
      : currentUserRole === 'Supplier'
      ? [
          { id: '1', name: 'Mike Entrepreneur', role: 'Entrepreneur' as UserRole },
        ]
      : [
          { id: '1', name: 'Alice Entrepreneur', role: 'Entrepreneur' as UserRole },
        ];

    // Add active contact if it doesn't exist in base contacts
    if (activeContact && !baseContacts.find(c => c.id === activeContact.id)) {
      return [...baseContacts, activeContact];
    }
    
    return baseContacts;
  };

  const contacts = getContacts();

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderRole: currentUserRole,
      content: newMessage,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  useEffect(() => {
    if (shouldOpenChat && activeContact) {
      setIsOpen(true);
      setSelectedContact(activeContact);
    }
  }, [shouldOpenChat, activeContact]);

  // If not open, show button
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
      {/* Header */}
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
            onClick={() => {
              setIsOpen(false);
              resetChat();
            }}
            className="hover:bg-white/20 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!selectedContact ? (
            /* Contacts List */
            <div className="flex-1 overflow-y-auto">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
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
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-[#0066cc] hover:underline text-sm"
                >
                  ← Back
                </button>
                <div className="font-semibold">
                  {contacts.find((c) => c.id === selectedContact)?.name}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isOwn
                          ? 'bg-[#0066cc] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className={`text-xs ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};