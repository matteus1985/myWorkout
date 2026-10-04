const CACHE = 'lift-log-shell-v7';
const CACHE_PREFIX = 'lift-log-shell-';
const BASE = new URL('./', self.location.href);
const FILES = [
  './', './index.html', './manifest.json', './icon.svg', './sw.js',
  './catalogue.js?v=15e222b', './planner.js?v=15e222b',
  './sketches.js?v=15e222b', './app.js?v=15e222b', './material.css?v=15e222b'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
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
