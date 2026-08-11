import assert from "node:assert/strict";
import test from "node:test";
import {isTrustedMutation} from "../lib/server/origin";
const request=(headers:Record<string,string>)=>new Request("https://app.example.com/api/vault",{method:"POST",headers});
test("accepts same-origin browser mutations",()=>assert.equal(isTrustedMutation(request({origin:"https://app.example.com","sec-fetch-site":"same-origin"})),true));
test("rejects cross-site browser mutations",()=>assert.equal(isTrustedMutation(request({origin:"https://attacker.example","sec-fetch-site":"cross-site"})),false));
test("allows non-browser clients without browser origin headers",()=>assert.equal(isTrustedMutation(request({})),true));
test("accepts configured public origin behind a proxy",()=>assert.equal(isTrustedMutation(new Request("http://internal:3000/api/vault",{method:"PUT",headers:{origin:"https://app.example.com","sec-fetch-site":"same-origin"}}),"https://app.example.com"),true));