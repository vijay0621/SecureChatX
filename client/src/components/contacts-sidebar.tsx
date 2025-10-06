import { useState } from "react";
import { Search, LogOut } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AvatarWithStatus } from "./avatar-with-status";
import { ContactItem } from "./contact-item";
import { ThemeToggle } from "./theme-toggle";
import { clearAuth, clearRSAKeys } from "@/lib/auth";
import type { ChatSession } from "@shared/schema";

interface ContactsSidebarProps {
  currentUser: { id: string; username: string };
  contacts: ChatSession[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onLogout: () => void;
}

export function ContactsSidebar({
  currentUser,
  contacts,
  selectedContactId,
  onSelectContact,
  onLogout,
}: ContactsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    clearAuth();
    clearRSAKeys();
    onLogout();
  };

  return (
    <div className="h-screen w-80 bg-sidebar border-r flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AvatarWithStatus username={currentUser.username} isOnline={true} size="sm" />
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-sm truncate" data-testid="text-current-username">
                {currentUser.username}
              </h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-contacts"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "No contacts found" : "No contacts yet"}
            </p>
            {!searchQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                Other users will appear here
              </p>
            )}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <ContactItem
              key={contact.userId}
              contact={contact}
              isSelected={selectedContactId === contact.userId}
              onClick={() => onSelectContact(contact.userId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
