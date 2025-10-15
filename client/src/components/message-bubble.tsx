import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  displayText?: string; // optional already-decrypted text to show
}

export function MessageBubble({ message, isSender, displayText }: MessageBubbleProps) {
  const getStatusIcon = () => {
    if (!isSender) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="h-4 w-4" data-testid={`status-sent-${message.id}`} />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4" data-testid={`status-delivered-${message.id}`} />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-[#2196f3]" data-testid={`status-read-${message.id}`} />;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mb-2",
        isSender ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${message.id}`}
    >
      <div className={cn("max-w-[65%] space-y-1")}>
        <div
          className={cn(
            "px-4 py-2 rounded-2xl break-words",
            isSender
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card text-card-foreground rounded-bl-sm border"
          )}
        >
          <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap" data-testid={`text-message-${message.id}`}>
            {displayText ?? message.encryptedContent}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-1 text-xs text-muted-foreground",
            isSender && "justify-end"
          )}
        >
          <span>{format(message.timestamp, "HH:mm")}</span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
