// BioSense Web Push service worker
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'BioSense', {
      body: data.body ?? '',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: data.tag ?? 'biosense',
      data: { url: data.url ?? '/dashboard' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/dashboard'
  event.waitUntil(clients.openWindow(url))
})
