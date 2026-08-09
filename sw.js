// Service Worker - 离线缓存支持
const CACHE_NAME = 'distance-tool-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 安装时缓存所有资源
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// 请求时优先使用缓存，失败时回退网络
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
});
