import { generateAESKey, encryptWithAES, decryptWithAES, encryptWithRSA, decryptWithRSA, generateHMAC, verifyHMAC } from "./crypto";
import { getRSAKeys } from "./auth";

export interface EncryptedMessage {
  encryptedContent: string;
  iv: string;
  hmac: string;
  encryptedAESKey: string;
}

export interface SessionKeys {
  [userId: string]: string;
}

const SESSION_KEYS_STORAGE = "securechat-session-keys";

export function getSessionKeys(): SessionKeys {
  const data = localStorage.getItem(SESSION_KEYS_STORAGE);
  return data ? JSON.parse(data) : {};
}

export function saveSessionKey(userId: string, aesKey: string): void {
  const keys = getSessionKeys();
  keys[userId] = aesKey;
  localStorage.setItem(SESSION_KEYS_STORAGE, JSON.stringify(keys));
}

export function getSessionKey(userId: string): string | null {
  const keys = getSessionKeys();
  return keys[userId] || null;
}

export async function encryptMessage(
  message: string,
  recipientPublicKey: string,
  recipientUserId: string
): Promise<EncryptedMessage> {
  let aesKey = getSessionKey(recipientUserId);
  
  if (!aesKey) {
    aesKey = await generateAESKey();
    saveSessionKey(recipientUserId, aesKey);
  }

  const { encrypted, iv } = await encryptWithAES(message, aesKey);
  
  const hmac = await generateHMAC(encrypted, aesKey);
  
  const encryptedAESKey = await encryptWithRSA(aesKey, recipientPublicKey);

  return {
    encryptedContent: encrypted,
    iv,
    hmac,
    encryptedAESKey,
  };
}

export async function decryptMessage(
  encryptedContent: string,
  iv: string,
  hmac: string,
  encryptedAESKey: string,
  senderUserId: string
): Promise<string | null> {
  try {
    let aesKey = getSessionKey(senderUserId);
    
    if (!aesKey) {
      const rsaKeys = getRSAKeys();
      if (!rsaKeys) throw new Error("No RSA keys found");
      
      aesKey = await decryptWithRSA(encryptedAESKey, rsaKeys.privateKey);
      saveSessionKey(senderUserId, aesKey);
    }

    const isValid = await verifyHMAC(encryptedContent, hmac, aesKey);
    if (!isValid) {
      console.error("Message integrity verification failed");
      return null;
    }

    const decrypted = await decryptWithAES(encryptedContent, iv, aesKey);
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}
