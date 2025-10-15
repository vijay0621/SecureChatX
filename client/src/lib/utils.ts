import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Lightweight JSON logs in localStorage
const LOG_STORAGE_KEY = "securechat-logs";
const LOG_MAX_ENTRIES = 1000;

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  ts: number;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
}

export function writeLog(level: LogLevel, event: string, data?: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    const arr: LogEntry[] = raw ? JSON.parse(raw) : [];
    arr.push({ ts: Date.now(), level, event, data });
    if (arr.length > LOG_MAX_ENTRIES) {
      arr.splice(0, arr.length - LOG_MAX_ENTRIES);
    }
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // ignore storage errors (e.g. Safari private mode)
  }
}

export function getLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
