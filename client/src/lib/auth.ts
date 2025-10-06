import type { User } from "@shared/schema";

const AUTH_KEY = "securechat-auth";
const RSA_KEYS_KEY = "securechat-rsa-keys";

interface AuthData {
  user: User;
  token: string;
}

interface RSAKeys {
  publicKey: string;
  privateKey: string;
}

export function saveAuth(data: AuthData): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function getAuth(): AuthData | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function saveRSAKeys(keys: RSAKeys): void {
  localStorage.setItem(RSA_KEYS_KEY, JSON.stringify(keys));
}

export function getRSAKeys(): RSAKeys | null {
  const data = localStorage.getItem(RSA_KEYS_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearRSAKeys(): void {
  localStorage.removeItem(RSA_KEYS_KEY);
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}
