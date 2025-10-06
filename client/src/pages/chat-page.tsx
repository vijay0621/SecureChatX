import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { ContactsSidebar } from "@/components/contacts-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { MessagesArea } from "@/components/messages-area";
import { MessageInput } from "@/components/message-input";
import { SecurityPanel } from "@/components/security-panel";
import { useWebSocket } from "@/lib/websocket";
import { getAuth } from "@/lib/auth";
import { encryptMessage, decryptMessage } from "@/lib/chat-crypto";
import { useToast } from "@/hooks/use-toast";
import type { ChatSession, Message } from "@shared/schema";

interface UserWithStatus {
  id: string;
  username: string;
  publicKey: string | null;
  isOnline: boolean;
  lastSeen: number;
}

export default function ChatPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [contacts, setContacts] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [decryptedMessages, setDecryptedMessages] = useState<{ [key: string]: string }>({});
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const ws = useWebSocket();
  const auth = getAuth();

  if (!auth) {
    window.location.reload();
    return null;
  }

  const { data: users, isLoading } = useQuery<UserWithStatus[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (users) {
      const chatSessions: ChatSession[] = users
        .filter(u => u.id !== auth.user.id && u.publicKey)
        .map(u => ({
          userId: u.id,
          username: u.username,
          publicKey: u.publicKey!,
          lastMessage: undefined,
          lastMessageTime: undefined,
          unreadCount: 0,
          isOnline: u.isOnline,
          lastSeen: u.lastSeen,
        }));
      setContacts(chatSessions);
    }
  }, [users, auth.user.id]);

  useEffect(() => {
    const unsubMessage = ws.onMessage(async (message) => {
      const contactId = message.senderId === auth.user.id ? message.receiverId : message.senderId;
      
      setMessages(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), message],
      }));

      if (message.senderId !== auth.user.id && message.encryptedAESKey) {
        const decrypted = await decryptMessage(
          message.encryptedContent,
          message.iv,
          message.hmac,
          message.encryptedAESKey,
          message.senderId
        );
        
        if (decrypted) {
          setDecryptedMessages(prev => ({
            ...prev,
            [message.id]: decrypted,
          }));

          if (selectedContactId === message.senderId) {
            ws.markMessageAsRead(message.id, message.senderId);
          }
        }
      } else {
        setDecryptedMessages(prev => ({
          ...prev,
          [message.id]: message.encryptedContent,
        }));
      }
    });

    const unsubStatus = ws.onMessageStatus((data) => {
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(contactId => {
          updated[contactId] = updated[contactId].map(msg =>
            msg.id === data.messageId ? { ...msg, status: data.status } : msg
          );
        });
        return updated;
      });
    });

    const unsubOnline = ws.onUserOnline((userId) => {
      setContacts(prev =>
        prev.map(c => c.userId === userId ? { ...c, isOnline: true } : c)
      );
    });

    const unsubOffline = ws.onUserOffline((data) => {
      setContacts(prev =>
        prev.map(c =>
          c.userId === data.userId
            ? { ...c, isOnline: false, lastSeen: data.lastSeen }
            : c
        )
      );
    });

    const unsubTyping = ws.onTyping((data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
        setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(data.userId);
            return next;
          });
        }, 3000);
      } else {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    });

    return () => {
      unsubMessage();
      unsubStatus();
      unsubOnline();
      unsubOffline();
      unsubTyping();
    };
  }, [ws, auth.user.id, selectedContactId]);

  const selectedContact = contacts.find(c => c.userId === selectedContactId);
  const currentMessages = selectedContactId ? messages[selectedContactId] || [] : [];

  const displayMessages = currentMessages.map(msg => ({
    ...msg,
    encryptedContent: decryptedMessages[msg.id] || msg.encryptedContent,
  }));

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setShowSecurityPanel(false);
    
    const unreadMessages = (messages[contactId] || []).filter(
      msg => msg.senderId === contactId && msg.status !== 'read'
    );
    unreadMessages.forEach(msg => {
      ws.markMessageAsRead(msg.id, msg.senderId);
    });
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedContact) return;

    try {
      const encrypted = await encryptMessage(
        message,
        selectedContact.publicKey,
        selectedContact.userId
      );

      ws.sendMessage(
        selectedContact.userId,
        encrypted.encryptedContent,
        encrypted.iv,
        encrypted.hmac,
        encrypted.encryptedAESKey
      );

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: auth.user.id,
        receiverId: selectedContact.userId,
        encryptedContent: message,
        iv: encrypted.iv,
        hmac: encrypted.hmac,
        timestamp: Date.now(),
        status: 'sent',
      };

      setMessages(prev => ({
        ...prev,
        [selectedContact.userId]: [...(prev[selectedContact.userId] || []), tempMessage],
      }));

      setDecryptedMessages(prev => ({
        ...prev,
        [tempMessage.id]: message,
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Could not encrypt message. Please try again.",
      });
    }
  }, [selectedContact, ws, auth.user.id, toast]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (selectedContactId) {
      ws.sendTyping(selectedContactId, isTyping);
    }
  }, [selectedContactId, ws]);

  const handleLogout = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ContactsSidebar
        currentUser={{ id: auth.user.id, username: auth.user.username }}
        contacts={contacts}
        selectedContactId={selectedContactId}
        onSelectContact={handleSelectContact}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col relative">
        {selectedContact ? (
          <>
            <ChatHeader
              contact={selectedContact}
              isTyping={typingUsers.has(selectedContactId!)}
              onInfoClick={() => setShowSecurityPanel(true)}
            />
            <MessagesArea
              messages={displayMessages}
              currentUserId={auth.user.id}
              isTyping={typingUsers.has(selectedContactId!)}
              typingUsername={selectedContact.username}
            />
            <MessageInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
            />
            
            {showSecurityPanel && (
              <SecurityPanel
                contactUsername={selectedContact.username}
                publicKeyFingerprint={selectedContact.publicKey}
                onClose={() => setShowSecurityPanel(false)}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-chat-bg">
            <div className="text-center space-y-4">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">SecureChat</h2>
                <p className="text-muted-foreground">
                  {contacts.length === 0 
                    ? "Waiting for other users to join..."
                    : "Select a contact to start a secure conversation"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
