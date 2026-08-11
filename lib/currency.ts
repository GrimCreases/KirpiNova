export const supportedCurrencies=["TRY","EUR","USD","GBP"] as const;
export type SupportedCurrency=typeof supportedCurrencies[number];
export type ExchangeRates={base:"EUR";date:string;rates:Record<SupportedCurrency,number>;source:string};
export const fallbackRates:ExchangeRates={base:"EUR",date:"",rates:{EUR:1,TRY:1,USD:1,GBP:1},source:"Unavailable"};
export function convertAmount(amount:number,from:string,to:string,rates:ExchangeRates["rates"]):number{
 if(from===to)return amount;
 const source=rates[from as SupportedCurrency],target=rates[to as SupportedCurrency];
 if(!Number.isFinite(source)||!Number.isFinite(target)||source<=0||target<=0)throw new Error("A required exchange rate is unavailable.");
 return amount/source*target;
}
export async function loadExchangeRates(signal?:AbortSignal):Promise<ExchangeRates>{
 const response=await fetch("/api/exchange-rates",{signal});
 if(!response.ok)throw new Error("Live exchange rates are unavailable.");
 const value=await response.json() as ExchangeRates;
 if(value.base!=="EUR"||!value.rates?.EUR)throw new Error("Exchange-rate data is invalid.");
 return value;
}