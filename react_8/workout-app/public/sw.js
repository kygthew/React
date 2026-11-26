/* =====================================================================
   Service Worker — written by hand (no Workbox).

   Caches
   ------
   shell-<version>  Pre-cached app shell: index.html, built JS/CSS, icons,
                    offline page. Replaced on every new build.
   pages-<version>  Pages (URLs) the user has visited, for offline reloads.
   static-v1        Runtime cache, CACHE-FIRST: images, icons, fonts.
   api-v1           Runtime cache, NETWORK-FIRST: public recipes API.

   Never cached: Firebase Auth, Firestore, Google sign-in, any request with
   an Authorization header — i.e. tokens and private user data.
   ===================================================================== */

// Both values are replaced at build time by the plugin in vite.config.js.
// The defaults below keep this file valid JavaScript before the build.
const VERSION = /*__BUILD_VERSION__*/ "dev";
const PRECACHE_ASSETS = /*__PRECACHE_ASSETS__*/ [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const SHELL_CACHE = `shell-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const STATIC_CACHE = "static-v1";
const API_CACHE = "api-v1";
const CURRENT_CACHES = [SHELL_CACHE, PAGES_CACHE, STATIC_CACHE, API_CACHE];

const OFFLINE_URL = "/offline.html";
const PUBLIC_API_ORIGINS = ["https://dummyjson.com"];
const IMAGE_ORIGINS = ["https://cdn.dummyjson.com", "https://fonts.gstatic.com"];
const NETWORK_TIMEOUT_MS = 4000;

// Limits that stop caches from growing forever
const LIMITS = {
  [STATIC_CACHE]: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
  [API_CACHE]: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 days
  [PAGES_CACHE]: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
};

/* ----------------------------- INSTALL ------------------------------ */
// Download and store the app shell. If any file fails, install fails and
// the old version keeps working.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // cache: "reload" skips the HTTP cache so we always store fresh files
      cache.addAll(PRECACHE_ASSETS.map((url) => new Request(url, { cache: "reload" })))
    )
  );
  // No skipWaiting() here: a new version waits until the user clicks "Update".
});

/* ----------------------------- ACTIVATE ----------------------------- */
// Delete caches from older versions, then take control of open tabs.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

/* ----------------------------- MESSAGES ----------------------------- */
self.addEventListener("message", (event) => {
  const { type, url } = event.data || {};

  // Sent when the user clicks "Update" in the banner
  if (type === "SKIP_WAITING") self.skipWaiting();

  // Sent by the app on every route change, so client-side visited pages
  // (which never hit the network) still open offline after a reload.
  if (type === "PAGE_VISITED" && url) {
    event.waitUntil(rememberPage(url));
  }
});

/* ------------------------------ FETCH ------------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // POST/PUT/DELETE → network only

  const url = new URL(request.url);
  if (!url.protocol.startsWith("http")) return;
  if (request.headers.has("Authorization")) return; // private → never cached
  if (url.pathname.startsWith("/__/")) return; // Firebase auth helper pages

  // 1. Page navigations: network-first, then visited page, then offline page
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2. Public API (list + details): network-first with cache fallback
  if (PUBLIC_API_ORIGINS.includes(url.origin)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // 3. Static assets (images, icons, fonts, JS/CSS): cache-first
  const isSameOriginStatic = url.origin === self.location.origin && isStaticAsset(url);
  if (isSameOriginStatic || IMAGE_ORIGINS.includes(url.origin)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 4. Everything else (Firebase, Firestore, Google...) is not touched.
});

/* ---------------------------- STRATEGIES ---------------------------- */

async function handleNavigation(request) {
  const url = new URL(request.url);

  // The offline page itself always comes from the cache
  if (url.pathname === "/offline" || url.pathname === OFFLINE_URL) {
    return (await caches.match(OFFLINE_URL)) || fetch(request);
  }

  try {
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT_MS);
    if (response.ok) await putInCache(PAGES_CACHE, url.pathname, response.clone());
    return response;
  } catch {
    // Offline: "/" is in the shell, other visited pages are in PAGES_CACHE
    const cached =
      (await caches.match(url.pathname, { cacheName: PAGES_CACHE })) ||
      (await caches.match(url.pathname, { cacheName: SHELL_CACHE }));
    if (cached) return cached;

    // Never visited → dedicated offline page
    return (
      (await caches.match(OFFLINE_URL)) ||
      new Response("<h1>You are offline</h1>", {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  }
}

// Network-first: fresh data when online; saved copy when offline or slow.
async function networkFirst(request, cacheName) {
  const network = fetch(request).then(async (response) => {
    if (response.ok) await putInCache(cacheName, request, response.clone());
    return response;
  });
  network.catch(() => {}); // avoid "unhandled rejection" if we answer from cache

  try {
    return await withTimeout(network, NETWORK_TIMEOUT_MS);
  } catch {
    const cached = await getFresh(cacheName, request);
    if (cached) return markAsCached(cached);

    // No saved copy: if the network was only slow, keep waiting for it
    try {
      return await network;
    } catch {
      return new Response(
        JSON.stringify({ message: "You are offline and this data has not been saved yet." }),
        {
          status: 503,
          headers: { "Content-Type": "application/json", "X-SW-Offline": "1" },
        }
      );
    }
  }
}

// Cache-first: static files rarely change, so use the saved copy if we have one.
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached && !isExpired(cached, cacheName)) return cached;

  try {
    const response = await fetch(request);
    // "opaque" = cross-origin <img> without CORS; it can still be cached
    if (response.ok || response.type === "opaque") {
      await putInCache(cacheName, request, response.clone());
    }
    return response;
  } catch {
    if (cached) return cached; // expired, but better than nothing
    // Missing image/icon offline: return an empty error response, the app keeps working
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

/* ----------------------------- HELPERS ------------------------------ */

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)$/.test(url.pathname)
  );
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

// Store a response with the time it was saved (used for expiration + UI),
// then delete the oldest entries if the cache is over its limit.
async function putInCache(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    let toStore = response;
    if (response.type !== "opaque") {
      const headers = new Headers(response.headers);
      headers.set("X-SW-Cached-At", String(Date.now()));
      toStore = new Response(await response.blob(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    await cache.put(request, toStore);
    await trimCache(cacheName);
  } catch (error) {
    // Quota full or similar — caching is optional, never break the request
    console.warn("[SW] could not cache", error);
  }
}

async function trimCache(cacheName) {
  const limit = LIMITS[cacheName];
  if (!limit) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys(); // oldest first
  const extra = keys.length - limit.maxEntries;
  for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
}

function isExpired(response, cacheName) {
  const savedAt = Number(response.headers.get("X-SW-Cached-At"));
  const limit = LIMITS[cacheName];
  if (!savedAt || !limit) return false; // precached files / opaque responses
  return Date.now() - savedAt > limit.maxAgeSeconds * 1000;
}

async function getFresh(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (!cached) return null;
  if (isExpired(cached, cacheName)) {
    await cache.delete(request);
    return null;
  }
  return cached;
}

// Add a header so the app can show "you are viewing saved data"
async function markAsCached(response) {
  const headers = new Headers(response.headers);
  headers.set("X-SW-Cache", "HIT");
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function rememberPage(url) {
  const { origin, pathname } = new URL(url, self.location.origin);
  if (origin !== self.location.origin || pathname === "/offline") return;
  const shell = await caches.match("/index.html", { cacheName: SHELL_CACHE });
  if (shell) await putInCache(PAGES_CACHE, pathname, shell);
}
