import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

let prngConfigured = false;

function ensureNaclPrng() {
  if (prngConfigured) return;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    nacl.setPRNG((x: Uint8Array, n: number) => {
      const bytes = new Uint8Array(n);
      window.crypto.getRandomValues(bytes);
      x.set(bytes);
    });
    prngConfigured = true;
  }
}

ensureNaclPrng();

export const getStorageKey = (userId?: string) => userId ? `gabvia_e2ee_priv_${userId}` : 'gabvia_e2ee_private_key';

export function getStoredKeyPair(userId?: string): { publicKeyBase64: string; privateKeyUint8: Uint8Array } | null {
  if (typeof window === 'undefined') return null;
  const keyName = getStorageKey(userId);
  let existingPrivKeyStr = window.localStorage.getItem(keyName);

  // If not found in user-scoped key, check legacy key and migrate it
  if (!existingPrivKeyStr) {
    existingPrivKeyStr = window.localStorage.getItem('gabvia_e2ee_private_key');
    if (existingPrivKeyStr && keyName && keyName !== 'gabvia_e2ee_private_key') {
      window.localStorage.setItem(keyName, existingPrivKeyStr);
    }
  }

  if (!existingPrivKeyStr) return null;

  try {
    const privateKeyUint8 = naclUtil.decodeBase64(existingPrivKeyStr);
    const keyPair = nacl.box.keyPair.fromSecretKey(privateKeyUint8);
    return {
      publicKeyBase64: naclUtil.encodeBase64(keyPair.publicKey),
      privateKeyUint8: keyPair.secretKey,
    };
  } catch (err) {
    console.warn("[E2EE] Corrupted private key in storage:", err);
    return null;
  }
}

export function deleteStoredKeyPair(userId?: string): void {
  if (typeof window === 'undefined') return;
  const keyName = getStorageKey(userId);
  window.localStorage.removeItem(keyName);
  if (userId) {
    window.localStorage.removeItem('gabvia_e2ee_private_key');
  }
}

export async function getOrGenerateKeyPair(userId?: string): Promise<{ publicKeyBase64: string; privateKeyUint8: Uint8Array; isNew: boolean }> {
  ensureNaclPrng();
  const existing = getStoredKeyPair(userId);
  if (existing) {
    return {
      ...existing,
      isNew: false,
    };
  }

  const keyPair = nacl.box.keyPair();
  const privStr = naclUtil.encodeBase64(keyPair.secretKey);
  const keyName = getStorageKey(userId);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(keyName, privStr);
    if (userId) {
      window.localStorage.removeItem('gabvia_e2ee_private_key');
    }
  }
  return {
    publicKeyBase64: naclUtil.encodeBase64(keyPair.publicKey),
    privateKeyUint8: keyPair.secretKey,
    isNew: true,
  };
}

/**
 * Derives a 32-byte key from a PIN and salt for use with secretbox.
 */
function deriveKeyFromPin(pin: string, salt: string): Uint8Array {
  const combined = pin + salt;
  const hash = nacl.hash(naclUtil.decodeUTF8(combined));
  return hash.slice(0, 32); // Use first 32 bytes of SHA-512
}

/**
 * Encrypts the private key with a PIN for server-side backup.
 */
export function encryptPrivateKeyForBackup(privateKey: Uint8Array, pin: string, salt: string): string {
  ensureNaclPrng();
  const key = deriveKeyFromPin(pin, salt);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(privateKey, nonce, key);
  return `${naclUtil.encodeBase64(nonce)}:${naclUtil.encodeBase64(encrypted)}`;
}

/**
 * Decrypts a backed-up private key using the PIN.
 */
export function decryptPrivateKeyFromBackup(encryptedData: string, pin: string, salt: string): Uint8Array | null {
  try {
    const [nonceBase64, encryptedBase64] = encryptedData.split(':');
    if (!nonceBase64 || !encryptedBase64) return null;
    const key = deriveKeyFromPin(pin, salt);
    const nonce = naclUtil.decodeBase64(nonceBase64);
    const encrypted = naclUtil.decodeBase64(encryptedBase64);
    const decrypted = nacl.secretbox.open(encrypted, nonce, key);
    return decrypted || null;
  } catch (e) {
    console.error("Backup decryption failed:", e);
    return null;
  }
}

/**
 * Saves a recovered private key to local storage.
 */
export async function saveRecoveredPrivateKey(privateKey: Uint8Array, userId?: string): Promise<string> {
  const keyStr = naclUtil.encodeBase64(privateKey);
  const keyName = getStorageKey(userId);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(keyName, keyStr);
    if (userId) {
      window.localStorage.removeItem('gabvia_e2ee_private_key');
    }
  }
  const keyPair = nacl.box.keyPair.fromSecretKey(privateKey);
  return naclUtil.encodeBase64(keyPair.publicKey);
}

export function encryptMessage(
  plainText: string,
  recipientPublicKeyBase64: string,
  senderPrivateKeyUint8: Uint8Array
): { nonce: string; cipherText: string } {
  ensureNaclPrng();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = naclUtil.decodeUTF8(plainText);
  const recipientPubKeyUint8 = naclUtil.decodeBase64(recipientPublicKeyBase64);

  const encryptedMessage = nacl.box(
    messageUint8,
    nonce,
    recipientPubKeyUint8,
    senderPrivateKeyUint8
  );

  return {
    nonce: naclUtil.encodeBase64(nonce),
    cipherText: naclUtil.encodeBase64(encryptedMessage),
  };
}

export function decryptMessage(
  cipherTextBase64: string,
  nonceBase64: string,
  senderPublicKeyBase64: string,
  recipientPrivateKeyUint8: Uint8Array
): string | null {
  try {
    const encryptedMessage = naclUtil.decodeBase64(cipherTextBase64);
    const nonce = naclUtil.decodeBase64(nonceBase64);
    const senderPubKeyUint8 = naclUtil.decodeBase64(senderPublicKeyBase64);

    const decryptedMessage = nacl.box.open(
      encryptedMessage,
      nonce,
      senderPubKeyUint8,
      recipientPrivateKeyUint8
    );

    if (!decryptedMessage) return null;
    return naclUtil.encodeUTF8(decryptedMessage);
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
}
