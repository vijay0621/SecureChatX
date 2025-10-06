import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { getAuth } from "./auth";
import type { Message, OnlineStatus, TypingStatus } from "@shared/schema";

interface WebSocketContextType {
  sendMessage: (receiverId: string, encryptedContent: string, iv: string, hmac: string, encryptedAESKey: string) => void;
  sendTyping: (targetUserId: string, isTyping: boolean) => void;
  markMessageAsRead: (messageId: string, senderId: string) => void;
  onMessage: (callback: (message: Message) => void) => () => void;
  onMessageStatus: (callback: (data: { messageId: string; status: 'delivered' | 'read' }) => void) => () => void;
  onUserOnline: (callback: (userId: string) => void) => () => void;
  onUserOffline: (callback: (data: { userId: string; lastSeen: number }) => void) => () => void;
  onTyping: (callback: (data: { userId: string; username: string; isTyping: boolean }) => void) => () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageCallbacksRef = useRef<Set<(message: Message) => void>>(new Set());
  const statusCallbacksRef = useRef<Set<(data: { messageId: string; status: 'delivered' | 'read' }) => void>>(new Set());
  const onlineCallbacksRef = useRef<Set<(userId: string) => void>>(new Set());
  const offlineCallbacksRef = useRef<Set<(data: { userId: string; lastSeen: number }) => void>>(new Set());
  const typingCallbacksRef = useRef<Set<(data: { userId: string; username: string; isTyping: boolean }) => void>>(new Set());

  useEffect(() => {
    const auth = getAuth();
    if (!auth) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({
        type: 'auth',
        userId: auth.user.id,
        username: auth.user.username,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          messageCallbacksRef.current.forEach(cb => cb(data.message));
          break;
        case 'message-sent':
          messageCallbacksRef.current.forEach(cb => cb(data.message));
          break;
        case 'message-status':
          statusCallbacksRef.current.forEach(cb => cb({ messageId: data.messageId, status: data.status }));
          break;
        case 'user-online':
          onlineCallbacksRef.current.forEach(cb => cb(data.userId));
          break;
        case 'user-offline':
          offlineCallbacksRef.current.forEach(cb => cb({ userId: data.userId, lastSeen: data.lastSeen }));
          break;
        case 'typing':
          typingCallbacksRef.current.forEach(cb => cb({ userId: data.userId, username: data.username, isTyping: data.isTyping }));
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (receiverId: string, encryptedContent: string, iv: string, hmac: string, encryptedAESKey: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        receiverId,
        encryptedContent,
        iv,
        hmac,
        encryptedAESKey,
      }));
    }
  };

  const sendTyping = (targetUserId: string, isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        targetUserId,
        isTyping,
      }));
    }
  };

  const markMessageAsRead = (messageId: string, senderId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message-read',
        messageId,
        senderId,
      }));
    }
  };

  const onMessage = (callback: (message: Message) => void) => {
    messageCallbacksRef.current.add(callback);
    return () => {
      messageCallbacksRef.current.delete(callback);
    };
  };

  const onMessageStatus = (callback: (data: { messageId: string; status: 'delivered' | 'read' }) => void) => {
    statusCallbacksRef.current.add(callback);
    return () => {
      statusCallbacksRef.current.delete(callback);
    };
  };

  const onUserOnline = (callback: (userId: string) => void) => {
    onlineCallbacksRef.current.add(callback);
    return () => {
      onlineCallbacksRef.current.delete(callback);
    };
  };

  const onUserOffline = (callback: (data: { userId: string; lastSeen: number }) => void) => {
    offlineCallbacksRef.current.add(callback);
    return () => {
      offlineCallbacksRef.current.delete(callback);
    };
  };

  const onTyping = (callback: (data: { userId: string; username: string; isTyping: boolean }) => void) => {
    typingCallbacksRef.current.add(callback);
    return () => {
      typingCallbacksRef.current.delete(callback);
    };
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        sendTyping,
        markMessageAsRead,
        onMessage,
        onMessageStatus,
        onUserOnline,
        onUserOffline,
        onTyping,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
