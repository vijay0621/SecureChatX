import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage, hashPassword, verifyPassword } from "./storage";
import { insertUserSchema, loginSchema, type Message, type OnlineStatus, type TypingStatus } from "@shared/schema";
import { randomUUID } from "crypto";

interface WebSocketClient extends WebSocket {
  userId?: string;
  username?: string;
}

const connectedClients = new Map<string, WebSocketClient>();

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = hashPassword(data.password);
      const user = await storage.createUser({
        username: data.username,
        password: hashedPassword,
      });

      const token = randomUUID();
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user || !verifyPassword(data.password, user.password)) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const token = randomUUID();
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/public-key", async (req, res) => {
    try {
      const { publicKey } = req.body;
      const userId = req.body.userId || req.headers['x-user-id'];
      
      if (!userId || !publicKey) {
        return res.status(400).json({ message: "User ID and public key required" });
      }

      await storage.updateUserPublicKey(userId as string, publicKey);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithStatus = await Promise.all(
        users.map(async (user) => ({
          id: user.id,
          username: user.username,
          publicKey: user.publicKey,
          isOnline: await storage.getOnlineStatus(user.id),
          lastSeen: await storage.getLastSeen(user.id),
        }))
      );
      res.json(usersWithStatus);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/public-key", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user || !user.publicKey) {
        return res.status(404).json({ message: "Public key not found" });
      }
      res.json({ publicKey: user.publicKey });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.headers['x-user-id'] as string;
      
      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const messages = await storage.getMessages(currentUserId, userId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'auth':
            ws.userId = message.userId;
            ws.username = message.username;
            connectedClients.set(message.userId, ws);
            await storage.setOnlineStatus(message.userId, true);
            
            broadcast({
              type: 'user-online',
              userId: message.userId,
              username: message.username,
            }, message.userId);
            break;

          case 'typing':
            const typingTarget = connectedClients.get(message.targetUserId);
            if (typingTarget && typingTarget.readyState === WebSocket.OPEN) {
              typingTarget.send(JSON.stringify({
                type: 'typing',
                userId: ws.userId,
                username: ws.username,
                isTyping: message.isTyping,
              }));
            }
            await storage.setTypingStatus(ws.userId!, message.targetUserId, message.isTyping);
            break;

          case 'message':
            const newMessage: Message = {
              id: randomUUID(),
              senderId: ws.userId!,
              receiverId: message.receiverId,
              encryptedContent: message.encryptedContent,
              iv: message.iv,
              hmac: message.hmac,
              timestamp: Date.now(),
              status: 'sent',
              encryptedAESKey: message.encryptedAESKey,
            };

            await storage.storeMessage(newMessage);

            ws.send(JSON.stringify({
              type: 'message-sent',
              message: newMessage,
            }));

            const recipientWs = connectedClients.get(message.receiverId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              newMessage.status = 'delivered';
              await storage.updateMessageStatus(newMessage.id, 'delivered');
              
              recipientWs.send(JSON.stringify({
                type: 'message',
                message: newMessage,
              }));

              ws.send(JSON.stringify({
                type: 'message-status',
                messageId: newMessage.id,
                status: 'delivered',
              }));
            }
            break;

          case 'message-read':
            await storage.updateMessageStatus(message.messageId, 'read');
            
            const msg = (await storage.getMessages(ws.userId!, message.senderId))
              .find(m => m.id === message.messageId);
            
            if (msg) {
              const senderWs = connectedClients.get(msg.senderId);
              if (senderWs && senderWs.readyState === WebSocket.OPEN) {
                senderWs.send(JSON.stringify({
                  type: 'message-status',
                  messageId: message.messageId,
                  status: 'read',
                }));
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (ws.userId) {
        await storage.setOnlineStatus(ws.userId, false);
        connectedClients.delete(ws.userId);
        
        broadcast({
          type: 'user-offline',
          userId: ws.userId,
          lastSeen: Date.now(),
        }, ws.userId);
      }
    });
  });

  function broadcast(message: any, excludeUserId?: string) {
    connectedClients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN && userId !== excludeUserId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
