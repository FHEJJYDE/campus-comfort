// Service Worker for caching and performance optimization
const CACHE_NAME = 'campus-comfort-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pwa-icons/android-chrome-192x192.png',
    '/pwa-icons/android-chrome-512x512.png',
    '/pwa-icons/apple-touch-icon.png',
    '/static/css/main.css',
    '/static/js/main.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Skip caching for external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request).then((response) => {
                    // Cache important assets
                    if (response.status === 200 &&
                        (event.request.destination === 'document' ||
                            event.request.destination === 'script' ||
                            event.request.destination === 'style')) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    return response;
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Handle push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const title = data.title || 'Tonys Estate Notification';
        const options = {
            body: data.body || 'You have a new notification',
            icon: '/pwa-icons/android-chrome-192x192.png',
            badge: '/pwa-icons/android-chrome-192x192.png',
            data: {
                url: data.url || '/'
            }
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});