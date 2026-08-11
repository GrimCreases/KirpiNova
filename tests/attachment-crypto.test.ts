import assert from "node:assert/strict";
import test from "node:test";
import { File } from "node:buffer";
import { decryptAttachment,encryptAttachment } from "../lib/attachment-crypto";

async function key(){return crypto.subtle.generateKey({name:"AES-GCM",length:256},false,["encrypt","decrypt"])}

test("attachment ciphertext decrypts to the original bytes",async()=>{const vaultKey={key:await key(),salt:new Uint8Array(16),iterations:600_000},file=new File([new TextEncoder().encode("private receipt bytes")],"receipt.txt",{type:"text/plain"}),id=crypto.randomUUID(),encrypted=await encryptAttachment(file,id,vaultKey),clear=await decryptAttachment(await encrypted.blob.arrayBuffer(),id,file.type,vaultKey);assert.equal(await clear.text(),"private receipt bytes");assert.equal(clear.type,"text/plain");assert.match(encrypted.contentHash,/^[A-Za-z0-9+/]{43}=$/)});

test("attachment tampering is rejected",async()=>{const vaultKey={key:await key(),salt:new Uint8Array(16),iterations:600_000},file=new File(["sensitive"],"note.txt"),id=crypto.randomUUID(),encrypted=await encryptAttachment(file,id,vaultKey),tampered=new Uint8Array(await encrypted.blob.arrayBuffer());tampered[tampered.length-1]^=1;await assert.rejects(()=>decryptAttachment(tampered.buffer,id,"text/plain",vaultKey),/integrity check failed/)});

test("attachment ciphertext is bound to its identifier",async()=>{const vaultKey={key:await key(),salt:new Uint8Array(16),iterations:600_000},file=new File(["sensitive"],"note.txt"),id=crypto.randomUUID(),encrypted=await encryptAttachment(file,id,vaultKey),source=await encrypted.blob.arrayBuffer();await assert.rejects(()=>decryptAttachment(source,crypto.randomUUID(),"text/plain",vaultKey),/integrity check failed/)});
