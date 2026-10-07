const CACHE = 'lift-log-shell-v15';
const CACHE_PREFIX = 'lift-log-shell-';
const BASE = new URL('./', self.location.href);
const FILES = [
  './', './index.html', './manifest.json', './icon.svg', './sw.js',
  './catalogue.js?v=liftlog-20261007-fixed-workout-header', './planner.js?v=liftlog-20261007-fixed-workout-header',
  './sketches.js?v=liftlog-20261007-fixed-workout-header', './app.js?v=liftlog-20261007-fixed-workout-header', './material.css?v=liftlog-20261007-fixed-workout-header'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('message', event => {
  if(event.data?.type!=='PREPARE_EXERCISE_ART'||!Array.isArray(event.data.urls))return;
  const urls=event.data.urls.map(value=>new URL(value,BASE).href);
  const client=event.source;
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);let ready=0,failed=0;
    for(let i=0;i<urls.length;i+=12){
      const batch=urls.slice(i,i+12);
      await Promise.all(batch.map(async url=>{
        try{if(await cache.match(url)){ready++;return;}const response=await fetch(url);if(!response.ok)throw Error('Image unavailable');await cache.put(url,response.clone());ready++;}
        catch{failed++;}
      }));
      client?.postMessage({type:'EXERCISE_ART_PROGRESS',ready,total:urls.length,failed});
    }
    client?.postMessage({type:'EXERCISE_ART_READY',ready,total:urls.length,failed});
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  const fresh=()=>fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  });
  if(event.request.mode==='navigate'||['script','style'].includes(event.request.destination)){
    event.respondWith(fresh().catch(()=>caches.match(event.request).then(hit=>hit||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
  }else{
    event.respondWith(caches.match(event.request).then(hit=>hit||fresh().catch(()=>Response.error())));
  }
});
