import { notifyDataChanged } from "@/lib/data-events";
export type TransactionType="income"|"expense"|"saving";
export type FinanceTransaction={id:string;type:TransactionType;amount:number;currency:string;date:string;description:string;category:string;balanceImpact:"cash"|"none";createdAt:string;receiptAttachmentId?:string;receiptAttachmentName?:string;receiptAttachmentType?:string};
export type FinanceDraft=Omit<FinanceTransaction,"id"|"createdAt">;
export type FinanceSubscription={id:string;name:string;amount:number;currency:string;category:string;nextDueDate:string;frequency:"monthly"|"yearly";active:boolean;lastRecordedDueDate?:string;createdAt:string};
export type FinanceSubscriptionDraft=Omit<FinanceSubscription,"id"|"createdAt"|"lastRecordedDueDate">;
const KEY="kirpinova-preview-finance-v1";
const SUBSCRIPTION_KEY="kirpinova-preview-finance-subscriptions-v1";
export const emptyFinanceDraft=():FinanceDraft=>({type:"expense",amount:0,currency:"TRY",date:new Date().toISOString().slice(0,10),description:"",category:"General",balanceImpact:"cash"});
export const emptySubscriptionDraft=():FinanceSubscriptionDraft=>({name:"",amount:0,currency:"TRY",category:"Subscriptions",nextDueDate:new Date().toISOString().slice(0,10),frequency:"monthly",active:true});
export const previewTransactions:FinanceTransaction[]=[
 {id:"salary",type:"income",amount:148230,currency:"TRY",date:"2026-08-01",description:"Monthly income",category:"Income",balanceImpact:"cash",createdAt:"2026-08-01T08:00:00Z"},
 {id:"groceries",type:"expense",amount:6840,currency:"TRY",date:"2026-08-03",description:"Household groceries",category:"Groceries",balanceImpact:"cash",createdAt:"2026-08-03T18:00:00Z"},
 {id:"utilities",type:"expense",amount:4275,currency:"TRY",date:"2026-08-05",description:"Utilities",category:"Bills",balanceImpact:"cash",createdAt:"2026-08-05T12:00:00Z"},
 {id:"saving-cash",type:"saving",amount:2624,currency:"TRY",date:"2026-08-06",description:"August savings",category:"Emergency fund",balanceImpact:"cash",createdAt:"2026-08-06T09:00:00Z"},
 {id:"saving-existing",type:"saving",amount:41084.05,currency:"TRY",date:"2026-08-07",description:"Prior savings recorded",category:"Existing savings",balanceImpact:"none",createdAt:"2026-08-07T09:00:00Z"},
 {id:"transport",type:"expense",amount:1570,currency:"TRY",date:"2026-08-09",description:"Transport",category:"Transport",balanceImpact:"cash",createdAt:"2026-08-09T17:00:00Z"}
];
export const financeRepository={load():FinanceTransaction[]{try{const raw=localStorage.getItem(KEY);if(!raw)return previewTransactions;const v=JSON.parse(raw);return Array.isArray(v)?v:previewTransactions}catch{return previewTransactions}},save(items:FinanceTransaction[]){localStorage.setItem(KEY,JSON.stringify(items));notifyDataChanged()}};
export const subscriptionRepository={load():FinanceSubscription[]{try{const raw=localStorage.getItem(SUBSCRIPTION_KEY);if(!raw)return [];const value=JSON.parse(raw);return Array.isArray(value)?value:[]}catch{return[]}},save(items:FinanceSubscription[]){localStorage.setItem(SUBSCRIPTION_KEY,JSON.stringify(items));notifyDataChanged()}};
const advanceDueDate=(date:string,frequency:FinanceSubscription["frequency"])=>{const value=new Date(date+"T12:00:00");if(frequency==="yearly")value.setFullYear(value.getFullYear()+1);else value.setMonth(value.getMonth()+1);return value.toISOString().slice(0,10)};
export function recordSubscription(subscription:FinanceSubscription,paidDate:string,id=crypto.randomUUID(),createdAt=new Date().toISOString()):{transaction:FinanceTransaction;subscription:FinanceSubscription}{
 if(subscription.lastRecordedDueDate===subscription.nextDueDate)throw new Error("This subscription due date has already been recorded.");
 return {transaction:{id,type:"expense",amount:subscription.amount,currency:subscription.currency,date:paidDate,description:subscription.name,category:subscription.category,balanceImpact:"cash",createdAt},subscription:{...subscription,lastRecordedDueDate:subscription.nextDueDate,nextDueDate:advanceDueDate(subscription.nextDueDate,subscription.frequency)}};
}export const money=(value:number,currency="TRY")=>new Intl.NumberFormat(undefined,{style:"currency",currency,maximumFractionDigits:2}).format(value);
