import assert from "node:assert/strict";
import test from "node:test";
import {convertAmount} from "../lib/currency";
const rates={EUR:1,USD:1.2,GBP:.8,TRY:48};
test("converts through the shared EUR pivot",()=>{assert.ok(Math.abs(convertAmount(100,"USD","TRY",rates)-4000)<.000001);assert.ok(Math.abs(convertAmount(100,"GBP","TRY",rates)-6000)<.000001)});
test("keeps same-currency values exact",()=>assert.equal(convertAmount(123.45,"TRY","TRY",rates),123.45));
test("rejects missing or invalid rates",()=>assert.throws(()=>convertAmount(10,"CAD","TRY",rates),/unavailable/));