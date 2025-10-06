export function TypingIndicator({ username }: { username: string }) {
  return (
    <div className="flex items-center gap-3 mb-2" data-testid="typing-indicator">
      <div className="max-w-[65%] space-y-1">
        <div className="bg-card text-card-foreground border px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '800ms' }} />
            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '800ms' }} />
            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '800ms' }} />
          </div>
        </div>
        <div className="px-1 text-xs text-muted-foreground">
          {username} is typing...
        </div>
      </div>
    </div>
  );
}
