import assert from "node:assert/strict";
import test from "node:test";
import {blankReceiptDraft,validateReceiptScan} from "../lib/receipt-scan";
test("accepts structured receipt data and canonicalizes an existing category",()=>{assert.deepEqual(validateReceiptScan({total:42.5,currency:"try",date:"2026-08-12",merchant:"Market",category:"groceries",confidence:"high"},["Groceries","Bills"]),{total:42.5,currency:"TRY",date:"2026-08-12",merchant:"Market",category:"Groceries",confidence:"high"})});
test("rejects missing totals instead of returning a partial guess",()=>assert.throws(()=>validateReceiptScan({total:null,currency:"TRY",date:null,merchant:null,category:null,confidence:"low"},[]),/incomplete/));
test("drops invented model categories",()=>assert.equal(validateReceiptScan({total:10,currency:"EUR",date:null,merchant:null,category:"Invented",confidence:"low"},["Food"]).category,null));
test("blank failure draft remains editable",()=>{const draft=blankReceiptDraft();assert.equal(draft.total,0);assert.equal(draft.currency,"TRY");assert.equal(draft.confidence,"low")});