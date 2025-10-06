import { AvatarWithStatus } from "./avatar-with-status";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@shared/schema";
import { Badge } from "./ui/badge";

interface ContactItemProps {
  contact: ChatSession;
  isSelected: boolean;
  onClick: () => void;
}

export function ContactItem({ contact, isSelected, onClick }: ContactItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 hover-elevate active-elevate-2 transition-colors border-b",
        isSelected && "bg-sidebar-accent"
      )}
      data-testid={`contact-item-${contact.userId}`}
    >
      <AvatarWithStatus
        username={contact.username}
        isOnline={contact.isOnline}
        size="sm"
      />
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm truncate">
            {contact.username}
          </h3>
          {contact.lastMessageTime && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatDistanceToNow(contact.lastMessageTime, { addSuffix: true })}
            </span>
          )}
        </div>
        
        {contact.lastMessage && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {contact.lastMessage}
          </p>
        )}
        
        {!contact.isOnline && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Last seen {formatDistanceToNow(contact.lastSeen, { addSuffix: true })}
          </p>
        )}
      </div>
      
      {contact.unreadCount > 0 && (
        <Badge 
          variant="default" 
          className="h-5 min-w-5 px-1.5 rounded-full text-xs"
          data-testid={`unread-count-${contact.userId}`}
        >
          {contact.unreadCount}
        </Badge>
      )}
    </button>
  );
}
