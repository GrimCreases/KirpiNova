import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDatabasePool } from "@/lib/server/database";

export const SESSION_COOKIE = "kn_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
export const tokenHash = (token: string) => createHash("sha256").update(token).digest();

export async function createSession(userId: string, userAgent = "") {
  const token=randomBytes(32).toString("base64url"),expiresAt=new Date(Date.now()+SESSION_SECONDS*1000);
  await getDatabasePool().query("insert into auth_session(user_id,token_hash,expires_at,user_agent_hash) values($1,$2,$3,$4)",[userId,tokenHash(token),expiresAt,userAgent?tokenHash(userAgent):null]);
  const jar=await cookies();jar.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SESSION_SECONDS});
}

export async function currentUser() {
  const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return null;
  const result=await getDatabasePool().query<{id:string;email:string}>("select u.id,u.email::text from auth_session s join app_user u on u.id=s.user_id where s.token_hash=$1 and s.revoked_at is null and s.expires_at>now() and u.status='active' and u.email_verified_at is not null",[tokenHash(token)]);
  return result.rows[0]||null;
}

export async function revokeSession() {
  const jar=await cookies(),token=jar.get(SESSION_COOKIE)?.value;
  if(token)await getDatabasePool().query("update auth_session set revoked_at=now() where token_hash=$1 and revoked_at is null",[tokenHash(token)]);
  jar.set(SESSION_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
}
