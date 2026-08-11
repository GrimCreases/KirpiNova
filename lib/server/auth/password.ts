import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = (password: string, salt: Buffer, length: number, options: { N: number; r: number; p: number; maxmem: number }) => new Promise<Buffer>((resolve, reject) => scryptCallback(password, salt, length, options, (error, derived) => error ? reject(error) : resolve(derived)));
const COST = 131072, BLOCK_SIZE = 8, PARALLELIZATION = 1, KEY_LENGTH = 32;

export function validatePassword(password: string) {
  if (password.length < 12) return "Use at least 12 characters.";
  if (password.length > 128) return "Password must be 128 characters or fewer.";
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
  return null;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION, maxmem: 256 * 1024 * 1024 }) as Buffer;
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm,nValue,rValue,pValue,saltValue,hashValue] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltValue || !hashValue) return false;
  const N=Number(nValue),r=Number(rValue),p=Number(pValue);
  if (N !== COST || r !== BLOCK_SIZE || p !== PARALLELIZATION) return false;
  const expected=Buffer.from(hashValue,"base64url"),salt=Buffer.from(saltValue,"base64url");
  const actual=await scrypt(password,salt,expected.length,{N,r,p,maxmem:256*1024*1024}) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual,expected);
}
