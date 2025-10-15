import { type User, type InsertUser, type Message, type OnlineStatus } from "@shared/schema";
import { randomUUID } from "crypto";
import { createHash, pbkdf2Sync, randomBytes } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPublicKey(userId: string, publicKey: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  storeMessage(message: Message): Promise<void>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  updateMessageStatus(messageId: string, status: 'delivered' | 'read'): Promise<void>;
  getUndeliveredMessagesFor(userId: string): Promise<Message[]>;
  
  setOnlineStatus(userId: string, isOnline: boolean): Promise<void>;
  getOnlineStatus(userId: string): Promise<boolean>;
  getLastSeen(userId: string): Promise<number>;
  
  setTypingStatus(userId: string, targetUserId: string, isTyping: boolean): Promise<void>;
  getTypingStatus(userId: string, targetUserId: string): Promise<boolean>;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;
  private onlineStatus: Map<string, { isOnline: boolean; lastSeen: number }>;
  private typingStatus: Map<string, Set<string>>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.onlineStatus = new Map();
    this.typingStatus = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, publicKey: null };
    this.users.set(id, user);
    this.onlineStatus.set(id, { isOnline: false, lastSeen: Date.now() });
    return user;
  }

  async updateUserPublicKey(userId: string, publicKey: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.publicKey = publicKey;
      this.users.set(userId, user);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async storeMessage(message: Message): Promise<void> {
    this.messages.set(message.id, message);
  }

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (msg) =>
          (msg.senderId === userId1 && msg.receiverId === userId2) ||
          (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async getUndeliveredMessagesFor(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.receiverId === userId && msg.status === 'sent')
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async updateMessageStatus(messageId: string, status: 'delivered' | 'read'): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.status = status;
      this.messages.set(messageId, message);
    }
  }

  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const current = this.onlineStatus.get(userId) || { isOnline: false, lastSeen: Date.now() };
    this.onlineStatus.set(userId, {
      isOnline,
      lastSeen: isOnline ? current.lastSeen : Date.now(),
    });
  }

  async getOnlineStatus(userId: string): Promise<boolean> {
    return this.onlineStatus.get(userId)?.isOnline || false;
  }

  async getLastSeen(userId: string): Promise<number> {
    return this.onlineStatus.get(userId)?.lastSeen || Date.now();
  }

  async setTypingStatus(userId: string, targetUserId: string, isTyping: boolean): Promise<void> {
    const key = `${userId}->${targetUserId}`;
    if (!this.typingStatus.has(targetUserId)) {
      this.typingStatus.set(targetUserId, new Set());
    }
    const typingSet = this.typingStatus.get(targetUserId)!;
    if (isTyping) {
      typingSet.add(userId);
    } else {
      typingSet.delete(userId);
    }
  }

  async getTypingStatus(userId: string, targetUserId: string): Promise<boolean> {
    const typingSet = this.typingStatus.get(targetUserId);
    return typingSet ? typingSet.has(userId) : false;
  }
}

export const storage = new MemStorage();
