const CACHE="kirpinova-offline-v1";
const SAFE_ASSETS=["/offline.html","/kirpinova-icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SAFE_ASSETS)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET"||request.mode!=="navigate")return;event.respondWith(fetch(request).catch(()=>caches.match("/offline.html")))});