import { previewStorageKeys } from "@/lib/preferences";

type EncryptedArchive = {
  format: "kirpinova-encrypted-archive";
  version: 1;
  createdAt: string;
  cipher: "AES-GCM";
  kdf: "PBKDF2-SHA-256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

const ITERATIONS = 310_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const bytesToBase64 = (bytes: Uint8Array) => { let binary = ""; for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000)); return btoa(binary); };
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function createEncryptedArchive(passphrase: string) {
  if (passphrase.length < 10) throw new Error("Use an archive passphrase with at least 10 characters.");
  const data = Object.fromEntries(previewStorageKeys.map((key) => [key, localStorage.getItem(key)]).filter((entry): entry is [string,string] => entry[1] !== null));
  const payload = encoder.encode(JSON.stringify({ format: "kirpinova-workspace", version: 1, data }));
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, payload);
  const archive: EncryptedArchive = { format: "kirpinova-encrypted-archive", version: 1, createdAt: new Date().toISOString(), cipher: "AES-GCM", kdf: "PBKDF2-SHA-256", iterations: ITERATIONS, salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(encrypted)) };
  return JSON.stringify(archive, null, 2);
}

export async function restoreEncryptedArchive(source: string, passphrase: string) {
  if (!passphrase) throw new Error("Enter the archive passphrase.");
  let archive: Partial<EncryptedArchive>;
  try { archive = JSON.parse(source); } catch { throw new Error("This is not a valid KirpiNova archive file."); }
  if (archive.format !== "kirpinova-encrypted-archive" || archive.version !== 1 || archive.cipher !== "AES-GCM" || archive.kdf !== "PBKDF2-SHA-256" || !archive.salt || !archive.iv || !archive.ciphertext || archive.iterations !== ITERATIONS) throw new Error("This archive format is not supported.");
  try {
    const salt = base64ToBytes(archive.salt), iv = base64ToBytes(archive.iv), ciphertext = base64ToBytes(archive.ciphertext);
    const key = await deriveKey(passphrase, salt, archive.iterations);
    const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, ciphertext as BufferSource);
    const payload = JSON.parse(decoder.decode(clear));
    if (payload?.format !== "kirpinova-workspace" || payload?.version !== 1 || typeof payload.data !== "object" || payload.data === null) throw new Error("invalid payload");
    const allowed = new Set(previewStorageKeys); let restored = 0;
    for (const [storageKey, value] of Object.entries(payload.data)) if (allowed.has(storageKey) && typeof value === "string") { localStorage.setItem(storageKey, value); restored += 1; }
    if (!restored) throw new Error("empty payload");
    return restored;
  } catch { throw new Error("The passphrase is incorrect, or the archive has been damaged."); }
}
