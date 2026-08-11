import assert from "node:assert/strict";
import test from "node:test";
import {createEncryptedArchive,restoreEncryptedArchive} from "../lib/secure-archive";

class MemoryStorage{private values=new Map<string,string>();getItem(key:string){return this.values.get(key)??null}setItem(key:string,value:string){this.values.set(key,String(value))}removeItem(key:string){this.values.delete(key)}clear(){this.values.clear()}}

test("encrypted archive round-trips workspace data",async()=>{
 const storage=new MemoryStorage();Object.defineProperty(globalThis,"localStorage",{value:storage,configurable:true});
 storage.setItem("kirpinova-preview-tasks-v1",JSON.stringify([{id:"private-task",title:"Private"}]));
 const archive=await createEncryptedArchive("correct horse battery staple");storage.clear();
 const restored=await restoreEncryptedArchive(archive,"correct horse battery staple");
 assert.equal(restored,1);assert.match(storage.getItem("kirpinova-preview-tasks-v1")||"",/private-task/);
});

test("encrypted archive rejects the wrong passphrase",async()=>{
 const storage=new MemoryStorage();Object.defineProperty(globalThis,"localStorage",{value:storage,configurable:true});storage.setItem("kirpinova-preview-tasks-v1","[]");
 const archive=await createEncryptedArchive("correct horse battery staple");await assert.rejects(()=>restoreEncryptedArchive(archive,"wrong passphrase"),/incorrect|damaged/);
});