import assert from "node:assert/strict";
import test from "node:test";
import {FinanceSubscription,recordSubscription} from "../lib/finance";

const subscription:FinanceSubscription={id:"sub-1",name:"Family streaming",amount:250,currency:"TRY",category:"Subscriptions",nextDueDate:"2026-08-15",frequency:"monthly",active:true,createdAt:"2026-08-01T00:00:00Z"};

test("recording a subscription creates a visible transaction dated when paid",()=>{
 const result=recordSubscription(subscription,"2026-08-11","tx-1","2026-08-11T09:00:00Z");
 assert.deepEqual(result.transaction,{id:"tx-1",type:"expense",amount:250,currency:"TRY",date:"2026-08-11",description:"Family streaming",category:"Subscriptions",balanceImpact:"cash",createdAt:"2026-08-11T09:00:00Z"});
 assert.equal(result.subscription.nextDueDate,"2026-09-15");
 assert.equal(result.subscription.lastRecordedDueDate,"2026-08-15");
});

test("the same subscription due date cannot be recorded twice",()=>{
 assert.throws(()=>recordSubscription({...subscription,lastRecordedDueDate:"2026-08-15"},"2026-08-11","tx-2"),/already been recorded/);
});