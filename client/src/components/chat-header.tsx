import { Lock, Info } from "lucide-react";
import { AvatarWithStatus } from "./avatar-with-status";
import { Button } from "./ui/button";
import type { ChatSession } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps {
  contact: ChatSession;
  isTyping: boolean;
  onInfoClick: () => void;
}

export function ChatHeader({ contact, isTyping, onInfoClick }: ChatHeaderProps) {
  const getStatusText = () => {
    if (isTyping) return "typing...";
    if (contact.isOnline) return "online";
    return `last seen ${formatDistanceToNow(contact.lastSeen, { addSuffix: true })}`;
  };

  return (
    <div className="h-16 bg-card border-b px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AvatarWithStatus
          username={contact.username}
          isOnline={contact.isOnline}
          size="sm"
        />
        <div>
          <h2 className="font-medium" data-testid="text-chat-contact-name">
            {contact.username}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-chat-status">
            {getStatusText()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-primary px-3 py-1.5 rounded-full bg-primary/10">
          <Lock className="h-3.5 w-3.5" />
          <span>Encrypted</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onInfoClick}
          data-testid="button-info"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
