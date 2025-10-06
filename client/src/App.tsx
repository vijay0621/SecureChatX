import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { WebSocketProvider } from "@/lib/websocket";
import { isAuthenticated } from "@/lib/auth";
import AuthPage from "@/pages/auth-page";
import ChatPage from "@/pages/chat-page";

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          {authenticated ? (
            <WebSocketProvider>
              <ChatPage />
            </WebSocketProvider>
          ) : (
            <AuthPage onAuthSuccess={() => setAuthenticated(true)} />
          )}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
