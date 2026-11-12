/* FitBox: recibe las notificaciones push y abre la app al tocarlas. */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch { d = { body: e.data ? e.data.text() : '' } }
  // Si la app está abierta, que recargue sus datos para que el aviso aparezca también en la campana.
  const tell = self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((wins) => wins.forEach((w) => w.postMessage({ type: 'fitbox-actualizar' })))
  e.waitUntil(Promise.all([tell,
    self.registration.showNotification(d.title || 'FitBox', {
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'badge-96.png', // Android la usa como silueta blanca: fondo transparente
      tag: d.tag,
      data: { url: d.url || self.registration.scope },
    }),
  ]))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) if (w.url.split('?')[0] === url && 'focus' in w) return w.focus()
      return self.clients.openWindow(url)
    }),
  )
})
