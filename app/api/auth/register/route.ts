import { randomBytes } from "node:crypto";
import { withDatabaseTransaction } from "@/lib/server/database-transaction";
import { hashPassword, validatePassword } from "@/lib/server/auth/password";
import { emailAddress,jsonError,passwordValue,readJson,validEmail } from "@/lib/server/auth/request";
import { tokenHash } from "@/lib/server/auth/session";

export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function POST(request:Request){
  try {
    const body=await readJson(request),email=emailAddress(body.email),password=passwordValue(body.password);
    if(!validEmail(email)) return jsonError("Enter a valid email address.");
    const passwordError=validatePassword(password); if(passwordError) return jsonError(passwordError);
    const hash=await hashPassword(password),verificationToken=randomBytes(32).toString("base64url");
    try {
      await withDatabaseTransaction(async(client)=>{
        const created=await client.query<{id:string}>("insert into app_user(email,password_hash) values($1,$2) returning id",[email,hash]);
        await client.query("insert into auth_token(user_id,purpose,token_hash,expires_at) values($1,'verify_email',$2,now()+interval '24 hours')",[created.rows[0].id,tokenHash(verificationToken)]);
      });
    } catch(error) {
      if((error as {code?:string}).code==="23505") return jsonError("An account with this email already exists.",409);
      throw error;
    }
    const response:Record<string,unknown>={ok:true,requiresVerification:true};
    if(process.env.AUTH_DEV_RETURN_TOKENS==="true") response.verificationToken=verificationToken;
    return Response.json(response,{status:201,headers:{"Cache-Control":"no-store"}});
  } catch(error) { return jsonError(error instanceof Error?error.message:"Account creation failed.",500); }
}