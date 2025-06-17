// 🚨 SERVICE WORKER DE EMERGÊNCIA - FORÇA LIMPEZA TOTAL E SE AUTO-DESABILITA
console.log('🚨 [SW EMERGÊNCIA] Iniciando limpeza total...');

// Instalação - limpa tudo
self.addEventListener('install', event => {
  console.log('🚨 [SW EMERGÊNCIA] Instalando e limpando TUDO...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('🚨 [SW EMERGÊNCIA] Caches encontrados:', cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🚨 [SW EMERGÊNCIA] DELETANDO cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('🚨 [SW EMERGÊNCIA] Todos os caches deletados! Forçando ativação...');
      return self.skipWaiting();
    })
  );
});

// Ativação - assume controle e força reload
self.addEventListener('activate', event => {
  console.log('🚨 [SW EMERGÊNCIA] Ativado! Assumindo controle...');
  
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('🚨 [SW EMERGÊNCIA] Controle assumido! Forçando reload de todas as páginas...');
      
      // Força reload de todas as páginas abertas
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          console.log('🚨 [SW EMERGÊNCIA] Forçando reload da página:', client.url);
          client.postMessage({
            type: 'FORCE_RELOAD',
            message: 'Service Worker de emergência ativado - forçando reload'
          });
        });
      });
    })
  );
});

// NÃO INTERCEPTA NADA - deixa tudo passar
self.addEventListener('fetch', event => {
  console.log('🚨 [SW EMERGÊNCIA] NÃO interceptando:', event.request.url);
  // Não faz nada - deixa a requisição passar normalmente
});

// Escuta mensagens dos clientes
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🚨 [SW EMERGÊNCIA] Recebido SKIP_WAITING');
    self.skipWaiting();
  }
});

console.log('🚨 [SW EMERGÊNCIA] Service Worker de emergência carregado!'); 