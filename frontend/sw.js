// Service Worker para OMúsicoCatólico PWA
const CACHE_NAME = 'omusicocatolico-v1';
const STATIC_CACHE = 'omusicocatolico-static-v1.0.0';
const DYNAMIC_CACHE = 'omusicocatolico-dynamic-v1.0.0';

// Recursos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/inicio',
  '/manifest.json',
  '/css/main.css',
  '/css/components.css',
  '/css/design-system.css',
  '/css/responsive.css',
  '/js/navigation.js',
  '/js/app.js',
  '/js/auth.js',
  '/js/config.js',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Páginas principais para cache
const PAGES_TO_CACHE = [
  '/inicio',
  '/favoritas',
  '/minhas-cifras',
  '/categorias',
  '/repertorios',
  '/repertorios-comunidade'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Service Worker instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Cache aberto');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache de páginas principais
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('[SW] Pré-cacheando páginas principais...');
        return cache.addAll(PAGES_TO_CACHE);
      })
    ])
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Service Worker ativado - LIMPANDO TODOS OS CACHES!');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // REMOVE TODOS OS CACHES - EMERGÊNCIA!
          console.log('[SW] EMERGÊNCIA - Removendo cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  
  // Assume controle imediato
  self.clients.claim();
});

// TEMPORARIAMENTE DESABILITADO - SERVICE WORKER ESTAVA CAUSANDO PROBLEMAS
// Interceptação de requisições
self.addEventListener('fetch', event => {
  // DESABILITADO: Deixar todas as requisições passarem normalmente
  // Isso vai forçar o navegador a buscar arquivos frescos
  console.log('[SW] MODO BYPASS - Não interceptando:', event.request.url);
  return; // Não intercepta nada
});

// Verifica se é um recurso estático
function isStaticAsset(url) {
  return url.includes('.css') || 
         url.includes('.js') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.svg') ||
         url.includes('fonts.googleapis.com') ||
         url.includes('cdnjs.cloudflare.com') ||
         url.includes('cdn.jsdelivr.net');
}

// Verifica se é uma requisição de página
function isPageRequest(request) {
  return request.method === 'GET' && 
         request.headers.get('accept') && 
         request.headers.get('accept').includes('text/html');
}

// Verifica se é uma requisição de API
function isApiRequest(url) {
  return url.includes('/api/');
}

// Cria página offline personalizada
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - OMúsicoCatólico</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 0; background: #f8fafc;
                display: flex; align-items: center; justify-content: center;
                min-height: 100vh; text-align: center;
            }
            .offline-container {
                max-width: 400px; padding: 2rem;
                background: white; border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            .offline-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #1f2937; }
            .offline-message { color: #6b7280; margin-bottom: 2rem; line-height: 1.5; }
            .retry-btn {
                background: #3b82f6; color: white; border: none;
                padding: 0.75rem 1.5rem; border-radius: 8px;
                font-weight: 500; cursor: pointer;
            }
            .retry-btn:hover { background: #2563eb; }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">🎵</div>
            <h1 class="offline-title">Você está offline</h1>
            <p class="offline-message">
                Não foi possível conectar ao OMúsicoCatólico. 
                Verifique sua conexão e tente novamente.
            </p>
            <button class="retry-btn" onclick="window.location.reload()">
                Tentar Novamente
            </button>
        </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Notificações push (futuro)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/assets/icons/action-open.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/assets/icons/action-close.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificações
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/inicio')
    );
  }
});

console.log('[SW] Service Worker carregado com sucesso!'); 