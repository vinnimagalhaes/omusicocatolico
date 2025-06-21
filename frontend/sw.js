// Service Worker Normal - Versão de produção
const CACHE_NAME = 'omusicocatolico-v1';
const urlsToCache = [
  '/',
  '/css/main.css',
  '/css/components.css',
  '/js/app.js',
  '/js/auth.js'
];

console.log('✅ [SW] Service Worker normal carregado!');

self.addEventListener('install', event => {
  console.log('✅ [SW] Instalando service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ [SW] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('✅ [SW] Ativando service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('✅ [SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Não cachear requisições POST, PUT, DELETE, etc.
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Não cachear URLs da API (dados dinâmicos)
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Estratégia: Network first, fallback para cache (apenas para GET)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta é válida, clona e armazena no cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, tenta buscar no cache
        return caches.match(event.request);
      })
  );
}); 