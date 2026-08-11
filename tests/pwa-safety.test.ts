import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
const worker=readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");
const offline=readFileSync(new URL("../public/offline.html",import.meta.url),"utf8");
test("offline cache excludes account and API content",()=>{assert.match(worker,/SAFE_ASSETS=\["\/offline\.html","\/kirpinova-icon\.svg"\]/);assert.doesNotMatch(worker,/caches\.put|\/api\//)});
test("offline page has no inline script handlers",()=>{assert.doesNotMatch(offline,/on(?:click|load|error)=/i);assert.match(offline,/<a href="\/">Try again<\/a>/)});