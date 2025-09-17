// Service Worker para notificações
self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada:', event.notification.tag)

  event.notification.close()

  // Abrir a aplicação quando a notificação for clicada
  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(clientList) {
        // Se já existe uma aba aberta, focar nela
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes(self.location.origin)) {
            return client.focus().then(() => client.navigate(urlToOpen))
          }
        }

        // Se não existe, abrir uma nova aba
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  } else if (event.action === 'dismiss') {
    // Apenas fechar a notificação
    console.log('Notificação dispensada')
  } else {
    // Clique na notificação (não nos botões)
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(clientList) {
        // Se já existe uma aba aberta, focar nela
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes(self.location.origin)) {
            return client.focus()
          }
        }

        // Se não existe, abrir uma nova aba
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})

// Lidar com notificações em background
self.addEventListener('notificationclose', function(event) {
  console.log('Notificação fechada:', event.notification.tag)
})

// Background sync para notificações (futuro)
self.addEventListener('sync', function(event) {
  if (event.tag === 'meal-reminder-sync') {
    console.log('Sincronizando lembretes de refeição')
    // Aqui poderia implementar sincronização de lembretes quando voltar online
  }
})

// Push notifications (para futuro uso com servidor)
self.addEventListener('push', function(event) {
  console.log('Push notification recebida')

  const options = {
    body: event.data ? event.data.text() : 'Lembrete de refeição!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'meal-reminder',
    requireInteraction: true,
    data: {
      url: '/refeicoes/adicionar'
    }
  }

  // Adicionar actions se suportado
  try {
    options.actions = [
      {
        action: 'open',
        title: 'Registrar Refeição'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  } catch (e) {
    // Actions não suportado, continuar sem eles
  }

  event.waitUntil(
    self.registration.showNotification('Calorias Tracker', options)
  )
})

// Cache básico para PWA
const CACHE_NAME = 'calorias-tracker-v1'
const urlsToCache = [
  '/',
  '/login',
  '/notificacoes',
  '/manifest.json',
  '/icons/icon-192x192.png'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response
        }
        return fetch(event.request)
      }
    )
  )
})