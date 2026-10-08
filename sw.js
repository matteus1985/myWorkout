const CACHE = 'lift-log-shell-v22';
const CACHE_PREFIX = 'lift-log-shell-';
const BASE = new URL('./', self.location.href);
const SHELL = [
  './', './index.html', './manifest.json', './icon.svg', './sw.js',
  './catalogue.js?v=liftlog-20261008-training-summary-v3',
  './planner.js?v=liftlog-20261008-training-summary-v3',
  './sketches.js?v=liftlog-20261008-training-summary-v3',
  './exercise-art.js?v=liftlog-20261008-training-summary-v3',
  './app.js?v=liftlog-20261008-training-summary-v3',
  './material.css?v=liftlog-20261008-training-summary-v3'
];

async function cacheShellFile(cache, path) {
  const url = new URL(path, BASE).href;
  for (let attempt = 0; attempt < 3; attempt++) {
    let timeout;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { cache: 'reload', signal: controller.signal });
      if (response.ok) {
        await cache.put(url, response);
        return true;
      }
    } catch {} finally { clearTimeout(timeout); }
    await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
  }
  const cached = await caches.match(url);
  if (!cached) return false;
  await cache.put(url, cached.clone());
  return true;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Keep previously downloaded exercise images while the shell version changes.
    const keys = await caches.keys();
    const oldCaches = await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.open(key)));
    for (const oldCache of oldCaches) {
      for (const request of await oldCache.keys()) {
        if (await cache.match(request)) continue;
        const response = await oldCache.match(request);
        if (response) await cache.put(request, response);
      }
    }
    const results = await Promise.all(SHELL.map(path => cacheShellFile(cache, path)));
    if (results.some(result => !result)) {
      await caches.delete(CACHE);
      throw new Error('App shell could not be cached completely');
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'PREPARE_EXERCISE_ART' || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.map(value => new URL(value, BASE).href);
  const client = event.source;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    let ready = 0, failed = 0;
    for (let i = 0; i < urls.length; i += 12) {
      await Promise.all(urls.slice(i, i + 12).map(async url => {
        try {
          if (await cache.match(url)) { ready++; return; }
          const response = await fetch(url);
          if (!response.ok) throw new Error('Image unavailable');
          await cache.put(url, response.clone());
          ready++;
        } catch { failed++; }
      }));
      client?.postMessage({ type: 'EXERCISE_ART_PROGRESS', ready, total: urls.length, failed });
    }
    client?.postMessage({ type: 'EXERCISE_ART_READY', ready, total: urls.length, failed });
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

async function refreshShellRequest(request) {
  const cache = await caches.open(CACHE);
  const url = request.url;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (response.ok) await cache.put(url, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request) || (request.mode === 'navigate' ? await caches.match(new URL('./index.html', BASE).href) : null);
    return cached || Response.error();
  } finally {
    clearTimeout(timeout);
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  if (event.request.mode === 'navigate' || ['script', 'style'].includes(event.request.destination)) {
    const refresh = refreshShellRequest(event.request);
    event.waitUntil(refresh.then(() => {}).catch(() => {}));
    event.respondWith((async () => await caches.match(event.request) || await refresh)());
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => Response.error())));
});
