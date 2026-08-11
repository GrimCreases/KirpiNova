import { isTrustedMutation } from "@/lib/server/origin";
import { getDatabasePool } from "@/lib/server/database";
import { verifyPassword } from "@/lib/server/auth/password";
import { emailAddress,jsonError,passwordValue,readJson } from "@/lib/server/auth/request";
import { createSession } from "@/lib/server/auth/session";
import { checkLoginThrottle,clearEmailThrottle } from "@/lib/server/auth/throttle";

export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function POST(request:Request) {
  if(!isTrustedMutation(request))return jsonError("Cross-site requests are not allowed.",403);
  try {
    const body=await readJson(request),email=emailAddress(body.email),password=passwordValue(body.password);
    if(!await checkLoginThrottle(request,email))return jsonError("Too many sign-in attempts. Wait 15 minutes and try again.",429);
    const result=await getDatabasePool().query<{id:string;password_hash:string;email_verified_at:Date|null}>("select id,password_hash,email_verified_at from app_user where email=$1 and status='active'",[email]);
    const user=result.rows[0];
    if(!user||!await verifyPassword(password,user.password_hash))return jsonError("Email or password is incorrect.",401);
    if(!user.email_verified_at)return jsonError("Verify your email address before signing in.",403);
    await createSession(user.id,request.headers.get("user-agent")||"");
    await clearEmailThrottle(email);
    return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  } catch { return jsonError("Sign-in is temporarily unavailable.",503); }
}