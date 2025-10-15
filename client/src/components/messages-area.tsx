import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { Message } from "@shared/schema";

interface MessagesAreaProps {
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  typingUsername?: string;
}

export function MessagesArea({ messages, currentUserId, isTyping, typingUsername }: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground">
            Start a secure conversation with end-to-end encryption
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-chat-bg" data-testid="messages-area">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isSender={message.senderId === currentUserId}
          displayText={(message as any).decryptedText ?? message.encryptedContent}
        />
      ))}
      {isTyping && typingUsername && (
        <TypingIndicator username={typingUsername} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
