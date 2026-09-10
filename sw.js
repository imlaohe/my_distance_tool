// Service Worker - 离线缓存支持
const CACHE_NAME = 'distance-tool-v4';
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

// 缓存策略：
// - 页面导航（HTML）：网络优先 —— 部署新版后刷新即可拿到最新页面，离线时回退缓存
// - 其他静态资源（图标等）：缓存优先 —— 省流量、离线可用，首次未命中再走网络并回填缓存
self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;

    const isHtml = req.mode === 'navigate' ||
        (req.headers.get('accept') || '').includes('text/html');

    if (isHtml) {
        e.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                    return res;
                })
                .catch(() =>
                    caches.match(req).then((cached) => cached || caches.match('./index.html'))
                )
        );
        return;
    }

    e.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                const copy = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                return res;
            });
        })
    );
});
