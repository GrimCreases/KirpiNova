export function isTrustedMutation(request:Request,configuredOrigin=process.env.NEXT_PUBLIC_APP_URL):boolean{
 const fetchSite=request.headers.get("sec-fetch-site");
 if(fetchSite&&fetchSite!=="same-origin")return false;
 const origin=request.headers.get("origin");
 if(!origin)return true;
 const allowed=new Set<string>([new URL(request.url).origin]);
 if(configuredOrigin){try{allowed.add(new URL(configuredOrigin).origin)}catch{return false}}
 return allowed.has(origin);
}