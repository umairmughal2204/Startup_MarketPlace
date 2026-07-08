import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from './AuthContext';

interface ChatContact {
  id: string;
  name: string;
  role: UserRole;
  productId?: string;
  productTitle?: string;
}

interface ChatContextType {
  openChatWithContact: (contact: ChatContact) => void;
  activeContact: ChatContact | null;
  shouldOpenChat: boolean;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [shouldOpenChat, setShouldOpenChat] = useState(false);

  const openChatWithContact = (contact: ChatContact) => {
    setActiveContact(contact);
    setShouldOpenChat(true);
  };

  const resetChat = () => {
    setShouldOpenChat(false);
  };

  return (
    <ChatContext.Provider
      value={{
        openChatWithContact,
        activeContact,
        shouldOpenChat,
        resetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
