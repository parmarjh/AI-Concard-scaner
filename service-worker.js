
const CACHE_NAME = 'ai-card-manager-cache-v2';
// Add assets that are essential for the app's shell to load.
const PRECACHE_URLS = [
  '/',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './maskable-icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];


self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache and caching precache URLs');
      // Using addAll, if one request fails, the entire operation fails.
      // This is good for ensuring the app shell is fully cached.
      return cache.addAll(PRECACHE_URLS);
    }).catch(error => {
      console.error('Failed to cache files during install:', error);
    })
  );
});

self.addEventListener('activate', event => {
  // Tell the active service worker to take control of the page immediately.
  event.waitUntil(self.clients.claim());
  // Remove old caches.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For API calls to Gemini or Firebase, we use a network-only strategy.
  // We don't want to cache these responses.
  const isApiCall = event.request.url.includes('googleapis.com') || event.request.url.includes('firebase');
  if (isApiCall) {
    // Respond from the network.
    return;
  }

  // For all other GET requests, use a "stale-while-revalidate" strategy.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Fetch from the network.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we get a valid response, we update the cache.
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(error => {
            console.warn('Fetch failed, possibly offline:', event.request.url, error);
            // The request will fail if offline, but if we have a cached response,
            // that one has already been returned.
        });

        // Return the cached response immediately if it exists,
        // otherwise, wait for the network response.
        return cachedResponse || fetchPromise;
      });
    })
  );
});
