import { isTrustedMutation } from "@/lib/server/origin";
import { jsonError } from "@/lib/server/auth/request";
import { revokeSession } from "@/lib/server/auth/session";export const runtime="nodejs";export const dynamic="force-dynamic";export async function POST(request:Request){if(!isTrustedMutation(request))return jsonError("Cross-site requests are not allowed.",403);try{await revokeSession()}catch{}return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}})}
