export async function generateRSAKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  };
}

export async function generateAESKey(): Promise<string> {
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exported = await window.crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

export async function encryptWithAES(message: string, keyBase64: string): Promise<{ encrypted: string; iv: string }> {
  const key = await window.crypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(keyBase64),
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoded
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  };
}

export async function decryptWithAES(encryptedBase64: string, ivBase64: string, keyBase64: string): Promise<string> {
  const key = await window.crypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(keyBase64),
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToArrayBuffer(ivBase64),
    },
    key,
    base64ToArrayBuffer(encryptedBase64)
  );

  return new TextDecoder().decode(decrypted);
}

export async function encryptWithRSA(data: string, publicKeyBase64: string): Promise<string> {
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(publicKeyBase64),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );

  const encoded = new TextEncoder().encode(data);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encoded
  );

  return arrayBufferToBase64(encrypted);
}

export async function decryptWithRSA(encryptedBase64: string, privateKeyBase64: string): Promise<string> {
  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(privateKeyBase64),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    base64ToArrayBuffer(encryptedBase64)
  );

  return new TextDecoder().decode(decrypted);
}

export async function generateHMAC(message: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return arrayBufferToBase64(signature);
}

export async function verifyHMAC(message: string, hmac: string, key: string): Promise<boolean> {
  const calculatedHMAC = await generateHMAC(message, key);
  return calculatedHMAC === hmac;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
