import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout: NodeJS.Timeout;

  const handleChange = (value: string) => {
    setMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    }
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-card border-t">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none min-h-[44px] max-h-[120px] rounded-full px-6 py-3"
          rows={1}
          disabled={disabled}
          data-testid="input-message"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-11 w-11 rounded-full flex-shrink-0"
          data-testid="button-send"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
