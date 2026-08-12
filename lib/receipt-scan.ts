export type ReceiptConfidence="high"|"low";
export type ReceiptScanResult={total:number;currency:string;date:string|null;merchant:string|null;category:string|null;confidence:ReceiptConfidence};
const currencies=/^[A-Z]{3}$/;
export function validateReceiptScan(value:unknown,categories:string[]):ReceiptScanResult{
 if(!value||typeof value!=="object")throw new Error("Receipt result is invalid.");
 const item=value as Record<string,unknown>,total=Number(item.total),currency=typeof item.currency==="string"?item.currency.trim().toUpperCase():"",date=item.date===null?null:typeof item.date==="string"?item.date:null,merchant=item.merchant===null?null:typeof item.merchant==="string"?item.merchant.trim()||null:null,category=item.category===null?null:typeof item.category==="string"?item.category.trim()||null:null,confidence=item.confidence;
 if(!Number.isFinite(total)||total<=0||!currencies.test(currency)||date!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(date)||!(["high","low"] as unknown[]).includes(confidence))throw new Error("Receipt result is incomplete.");
 const matched=category?categories.find(value=>value.toLocaleLowerCase()===category.toLocaleLowerCase())||null:null;
 return{total,currency,date,merchant,category:matched,confidence:confidence as ReceiptConfidence};
}
export function blankReceiptDraft(){return{total:0,currency:"TRY",date:new Date().toISOString().slice(0,10),merchant:"",category:"",confidence:"low" as const}}