import "server-only";
import { createHash } from "node:crypto";
import { getDatabasePool } from "@/lib/server/database";

const digest=(value:string)=>createHash("sha256").update(value).digest();
export async function checkLoginThrottle(request:Request,email:string){
  const address=(request.headers.get("x-real-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown").trim();
  const database=getDatabasePool(),emailHash=digest(email),addressHash=digest(address);
  const limited=await database.query<{limited:boolean}>("select (count(*) filter(where scope='email')>=10 or count(*) filter(where scope='address')>=50) as limited from auth_attempt where attempted_at>now()-interval '15 minutes' and ((scope='email' and key_hash=$1) or (scope='address' and key_hash=$2))",[emailHash,addressHash]);
  if(limited.rows[0]?.limited)return false;
  await database.query("insert into auth_attempt(scope,key_hash) values('email',$1),('address',$2)",[emailHash,addressHash]);
  return true;
}
export async function clearEmailThrottle(email:string){await getDatabasePool().query("delete from auth_attempt where scope='email' and key_hash=$1",[digest(email)]);}
export async function checkRecoveryThrottle(request:Request,email:string){
 const address=(request.headers.get("x-real-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown").trim();
 const database=getDatabasePool(),emailHash=digest(email),addressHash=digest(address);
 const limited=await database.query<{limited:boolean}>("select (count(*) filter(where scope='recovery_email')>=5 or count(*) filter(where scope='recovery_address')>=25) as limited from auth_attempt where attempted_at>now()-interval '15 minutes' and ((scope='recovery_email' and key_hash=$1) or (scope='recovery_address' and key_hash=$2))",[emailHash,addressHash]);
 if(limited.rows[0]?.limited)return false;
 await database.query("insert into auth_attempt(scope,key_hash) values('recovery_email',$1),('recovery_address',$2)",[emailHash,addressHash]);
 return true;
}