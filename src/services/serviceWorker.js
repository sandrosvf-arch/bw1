// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);

          // Verifica por updates periodicamente
          setInterval(() => {
            registration.update();
          }, 60000); // A cada minuto

          // Escuta por atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nova versão disponível! Recarregue a página.');
                // Opcionalmente, pode mostrar uma notificação ao usuário
                if (confirm('Nova versão disponível! Deseja recarregar?')) {
                  newWorker.postMessage('skipWaiting');
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });

      // Recarrega quando o Service Worker assume o controle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service Worker desregistrado');
      })
      .catch((error) => {
        console.error('Erro ao desregistrar Service Worker:', error);
      });
  }
}
