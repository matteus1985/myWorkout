const CACHE = 'lift-log-shell-v4';
const FILES = ['./', './index.html', './manifest.json', './icon.svg', './exercise-data.js',
  ...['incline-press','chest-press','row','vertical-pull','fly','lateral-raise','hip-thrust','hinge','knee-extension','leg-curl','calf-raise','crunch','rear-delt','curl','triceps','leg-raise','pullover','dip'].map(name=>'./media/'+name+'.gif')];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const fresh=()=>fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  });
  if(event.request.mode==='navigate'||event.request.destination==='script'){
    event.respondWith(fresh().catch(()=>caches.match(event.request).then(hit=>hit||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
  }else{
    event.respondWith(caches.match(event.request).then(hit=>hit||fresh().catch(()=>Response.error())));
  }
});
