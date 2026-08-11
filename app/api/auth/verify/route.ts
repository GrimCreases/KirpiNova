import { withDatabaseTransaction } from "@/lib/server/database-transaction";
import { jsonError,readJson } from "@/lib/server/auth/request";
import { createSession,tokenHash } from "@/lib/server/auth/session";

export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function POST(request:Request){
  try {
    const body=await readJson(request),token=typeof body.token==="string"?body.token:"";
    if(token.length<32) return jsonError("Verification link is invalid or expired.");
    const userId=await withDatabaseTransaction(async(client)=>{
      const found=await client.query<{user_id:string}>("select user_id from auth_token where token_hash=$1 and purpose='verify_email' and consumed_at is null and expires_at>now() for update",[tokenHash(token)]);
      if(!found.rows[0]) return null;
      await client.query("update auth_token set consumed_at=now() where token_hash=$1",[tokenHash(token)]);
      await client.query("update app_user set email_verified_at=coalesce(email_verified_at,now()),updated_at=now() where id=$1",[found.rows[0].user_id]);
      return found.rows[0].user_id;
    });
    if(!userId) return jsonError("Verification link is invalid or expired.");
    await createSession(userId,request.headers.get("user-agent")||"");
    return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return jsonError(error instanceof Error?error.message:"Verification failed.",500); }
}