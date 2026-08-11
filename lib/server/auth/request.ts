import "server-only";

export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("Send the request as JSON.");
  const length=Number(request.headers.get("content-length")||0);if(length>16_384)throw new Error("Request is too large.");
  return request.json() as Promise<Record<string,unknown>>;
}
export const emailAddress=(value:unknown)=>typeof value==="string"?value.trim().toLowerCase():"";
export const passwordValue=(value:unknown)=>typeof value==="string"?value:"";
export const validEmail=(value:string)=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const jsonError=(message:string,status=400)=>Response.json({ok:false,error:message},{status,headers:{"Cache-Control":"no-store"}});
