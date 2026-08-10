const CACHE='gaming-archive-v1-6-direct-cover-fix';
const ASSETS=['./','./index.html','./styles.css','./cover-fix.css','./app.js','./data.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./assets/covers/world-at-war.jpg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.pathname.endsWith('/styles.css')){
    e.respondWith(Promise.all([
      fetch('./styles.css',{cache:'no-store'}).then(r=>r.text()),
      fetch('./cover-fix.css',{cache:'no-store'}).then(r=>r.text())
    ]).then(([base,fix])=>new Response(base+'\n'+fix,{headers:{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-store'}})).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
