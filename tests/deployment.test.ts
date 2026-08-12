import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";

test("production container runs migrations before the web server",async()=>{
 const [dockerfile,start]=await Promise.all([readFile("Dockerfile","utf8"),readFile("scripts/start-production.sh","utf8")]);
 assert.match(dockerfile,/COPY --from=dependencies .*\/app\/node_modules \.\/node_modules/);
 assert.match(dockerfile,/COPY --from=builder .*\/app\/database \.\/database/);
 assert.match(dockerfile,/COPY --from=builder .*\/app\/scripts \.\/scripts/);
 assert.match(dockerfile,/CMD \["sh", "scripts\/start-production\.sh"\]/);
 assert.match(start,/node scripts\/migrate\.mjs/);
 assert.match(start,/exec node server\.js/);
 assert.ok(start.indexOf("migrate.mjs")<start.indexOf("server.js"));
});