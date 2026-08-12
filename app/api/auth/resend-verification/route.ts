import {randomBytes} from "node:crypto";
import {isTrustedMutation} from "@/lib/server/origin";
import {withDatabaseTransaction} from "@/lib/server/database-transaction";
import {emailAddress,jsonError,readJson,validEmail} from "@/lib/server/auth/request";
import {tokenHash} from "@/lib/server/auth/session";
import {sendVerificationEmail} from "@/lib/server/email";

export const runtime="nodejs";export const dynamic="force-dynamic";
const GENERIC_MESSAGE="If an unverified account exists for that address, a verification message will arrive shortly.";
export async function POST(request:Request){
 if(!isTrustedMutation(request))return jsonError("Cross-site requests are not allowed.",403);
 try{
  const body=await readJson(request),email=emailAddress(body.email);
  if(!validEmail(email))return jsonError("Enter a valid email address.");
  const verificationToken=randomBytes(32).toString("base64url");
  await withDatabaseTransaction(async client=>{
   const found=await client.query<{id:string}>("select id from app_user where email=$1 and status='active' and email_verified_at is null for update",[email]);
   const user=found.rows[0];if(!user)return;
   const recent=await client.query("select 1 from auth_token where user_id=$1 and purpose='verify_email' and consumed_at is null and created_at>now()-interval '5 minutes' limit 1",[user.id]);
   if(recent.rows[0])return;
   await client.query("insert into auth_token(user_id,purpose,token_hash,expires_at) values($1,'verify_email',$2,now()+interval '24 hours')",[user.id,tokenHash(verificationToken)]);
   if(process.env.AUTH_DEV_RETURN_TOKENS!=="true")await sendVerificationEmail(email,verificationToken);
   await client.query("update auth_token set consumed_at=now() where user_id=$1 and purpose='verify_email' and consumed_at is null and token_hash<>$2",[user.id,tokenHash(verificationToken)]);
  });
  return Response.json({ok:true,message:GENERIC_MESSAGE},{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({ok:true,message:GENERIC_MESSAGE},{headers:{"Cache-Control":"no-store"}})}
}