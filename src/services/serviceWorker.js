// Service Worker Registration
let updateCheckInterval = null;

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);

          // Verifica por updates periodicamente - apenas uma vez
          if (!updateCheckInterval) {
            updateCheckInterval = setInterval(() => {
              registration.update();
            }, 60000); // A cada minuto
          }

          // Escuta por atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nova versão disponível! Recarregue a página.');
                // Mostra notificação visual não-bloqueante
                showUpdateNotification(newWorker);
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

function showUpdateNotification(newWorker) {
  // Cria uma notificação simples e não-bloqueante
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2563eb;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    gap: 12px;
    align-items: center;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  `;
  
  notification.innerHTML = `
    <span>Nova versão disponível!</span>
    <button id="sw-update-btn" style="background: white; color: #2563eb; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
      Atualizar
    </button>
    <button id="sw-dismiss-btn" style="background: transparent; color: white; border: 1px solid white; padding: 6px 16px; border-radius: 6px; cursor: pointer;">
      Depois
    </button>
  `;
  
  document.body.appendChild(notification);
  
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    newWorker.postMessage('skipWaiting');
    notification.remove();
  });
  
  document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-remove após 10 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Limpa o interval se existir
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval);
      updateCheckInterval = null;
    }
    
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
