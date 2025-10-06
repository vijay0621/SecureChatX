import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  publicKey: text("public_key"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  encryptedContent: string;
  iv: string;
  hmac: string;
  timestamp: number;
  status: MessageStatus;
  encryptedAESKey?: string;
}

export interface OnlineStatus {
  userId: string;
  username: string;
  isOnline: boolean;
  lastSeen: number;
}

export interface TypingStatus {
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ChatSession {
  userId: string;
  username: string;
  publicKey: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  isOnline: boolean;
  lastSeen: number;
}

export interface PublicKeyExchange {
  userId: string;
  username: string;
  publicKey: string;
}
