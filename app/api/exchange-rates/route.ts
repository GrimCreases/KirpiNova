export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ENDPOINT = "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD,GBP";
const ALLOWED = new Set(["EUR","TRY","USD","GBP"]);

type FrankfurterResponse = { base?: unknown; date?: unknown; rates?: unknown };

export async function GET() {
  try {
    const response = await fetch(ENDPOINT,{signal:AbortSignal.timeout(8000),redirect:"error",headers:{Accept:"application/json"},next:{revalidate:3600}});
    if(!response.ok) return Response.json({error:"Exchange rates are temporarily unavailable."},{status:502,headers:{"Cache-Control":"no-store"}});
    const body = await response.json() as FrankfurterResponse;
    if(body.base!=="EUR"||typeof body.date!=="string"||!body.rates||typeof body.rates!=="object") throw new Error("Invalid exchange-rate response");
    const rates:Record<string,number>={EUR:1};
    for(const [currency,value] of Object.entries(body.rates)){if(ALLOWED.has(currency)&&typeof value==="number"&&Number.isFinite(value)&&value>0)rates[currency]=value}
    if(!rates.TRY||!rates.USD||!rates.GBP) throw new Error("Incomplete exchange-rate response");
    return Response.json({base:"EUR",date:body.date,rates,source:"Frankfurter / ECB"},{headers:{"Cache-Control":"public, max-age=600, s-maxage=3600, stale-while-revalidate=86400"}});
  } catch {
    return Response.json({error:"Exchange rates are temporarily unavailable."},{status:502,headers:{"Cache-Control":"no-store"}});
  }
}