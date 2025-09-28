const CACHE_NAME = 'dcall-v2'; // Update cache name for new version
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/script.js',
    '/settings.js',
    '/js/functions.js',
    '/img/hns.ico',
    '/img/tel.png',
    '/img/sn.png',
    '/img/tg.png',
    '/img/mail.png',
    '/img/simplex.png',
    '/img/wa.png',
    '/img/tb.png',
    '/img/x.png',
    '/img/link.png',
    '/img/onion.png',
    '/img/gh.png',
    '/img/ig.png',
    '/img/fb.png',
    '/img/yt.png',
    '/img/rumble.png',
    '/img/ens.png',
    '/img/nostr.png',
    '/img/pkdns.png',
    '/img/matrix.png',
    '/img/bsky.png',
    '/img/btc.png',
    '/img/ln.png',
    '/img/hns.png',
    '/img/eth.png',
    '/img/xmr.png',
    '/img/zec.png',
    '/img/bat.png',
    '/img/icon-192.png',
    '/img/icon-512.png',
    '/img/icon-maskable.png',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
            .catch(() => {
                // Optional: Return a fallback offline page if needed
                return caches.match('/index.html');
            })
    );
});
