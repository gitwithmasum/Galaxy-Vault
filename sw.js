/* VAULT//OS service worker — static app-shell cache only.
   Encrypted vault records remain in IndexedDB and are never copied into Cache Storage. */
const CACHE_PREFIX = "vault-os-shell-";
const CACHE_VERSION = "v2";
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa.js",
  "./icons/vault-icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache password breach lookup responses or other API traffic.
  if (url.hostname === "api.pwnedpasswords.com") return;

  // App navigation: try network first, then the cached app shell.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("./index.html", fresh.clone());
        }
        return fresh;
      } catch (_) {
        return (await caches.match(request)) ||
          (await caches.match("./index.html")) ||
          new Response("VAULT is offline and its app shell is not cached yet.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
      }
    })());
    return;
  }

  // Cache same-origin app assets and the explicitly used UI CDN/font assets.
  const isSameOrigin = url.origin === self.location.origin;
  const isUiDependency =
    url.hostname === "cdn.tailwindcss.com" ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  if (!isSameOrigin && !isUiDependency) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const fresh = await fetch(request);
      if (fresh && (fresh.ok || fresh.type === "opaque")) {
        await cache.put(request, fresh.clone());
      }
      return fresh;
    } catch (_) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.destination === "image") {
        return new Response("", { status: 504 });
      }
      return new Response("This resource is unavailable offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
