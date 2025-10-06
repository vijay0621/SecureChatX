import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarWithStatusProps {
  username: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarWithStatus({ username, isOnline, size = "md", className }: AvatarWithStatusProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const dotSizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getColorFromName = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-rose-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarFallback className={cn(getColorFromName(username), "text-white font-medium")}>
          {getInitials(username)}
        </AvatarFallback>
      </Avatar>
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            dotSizeClasses[size],
            isOnline ? "bg-primary" : "bg-muted-foreground"
          )}
          data-testid={`status-${isOnline ? 'online' : 'offline'}`}
        />
      )}
    </div>
  );
}
