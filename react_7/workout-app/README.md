# Workout Dashboard

A React app for planning workouts and finding meal ideas. It is an **installable PWA** that works offline.

It is built with React Router, Firebase Authentication (Email/Password and Google), Firestore, TanStack Query and a hand-written Service Worker.

## Features

- Sign up, log in, Google sign-in and logout. The session stays after a page refresh.
- Protected routes `/workouts`, `/workouts/:id` and `/profile`. Guests are redirected to `/login`.
- Workouts:
  - add, complete and remove exercises;
  - filter with `?filter=` and reverse the order with `?order=desc`.
- Meal ideas (public API, [dummyjson recipes](https://dummyjson.com/docs/recipes)):
  - `/recipes` has search (`?q=`) and pagination (`?page=`);
  - `/recipes/:id` shows the details.
- PWA:
  - install prompt;
  - offline support;
  - online/offline indicator;
  - "new version available" banner;
  - `/offline` page.
- Responsive layout from 320px, with a burger menu on mobile.

## Setup

```bash
npm install
cp .env.example .env.local  
npm run dev
```

In Firebase:

1. Enable **Email/Password** and **Google** sign-in.
2. Create a **Firestore** database and paste the rules from `firestore.rules`.

To test the PWA, run a production build. The service worker is turned off in `npm run dev`.

```bash
npm run build && npm run preview
```

## PWA

### Manifest

`public/manifest.json` sets the name, short_name, `start_url` and `scope` (both `/`), `display: standalone`, the theme and background colors, and icons at 192×192, 512×512 and 512 maskable. It is linked in `index.html`.

### Service Worker (`public/sw.js`, no Workbox)

- **install**: pre-caches the app shell. That includes `index.html`, all built JS/CSS, the icons, the manifest and `offline.html`. A small Vite plugin (`pwa-precache-plugin.js`) writes the list of built files and a version hash into `sw.js` after every build.
- **activate**: deletes caches from old versions and takes control of open tabs.
- **fetch**: sends each request to the caching strategy for its type (see the table below).
- **Updates**: a new version installs in the background and waits. The app then shows a *"A new version is available — Update now"* banner. The button sends `SKIP_WAITING`, and the page reloads once with the new version. Users never have to clear their storage by hand.

| Cache | Strategy | Used for | Limit |
|---|---|---|---|
| `shell-<version>` | pre-cache | app shell, JS/CSS, icons, offline page | replaced on each build |
| `pages-<version>` | network-first | pages you visited, so they reopen offline | 30 entries, 7 days |
| `static-v1` | **cache-first** | images, icons, fonts | 60 entries, 30 days |
| `api-v1` | **network-first** (4 s timeout) | public recipes API: list and details | 50 entries, 7 days |

When the API answer comes from the cache, the SW adds an `X-SW-Cache: HIT` header. The app then shows a *"Showing saved data from …"* label.

**Never cached:** Firebase Auth, Firestore, Google sign-in, and any request with an `Authorization` header. This keeps tokens and private workouts out of shared caches. While offline, workout changes are disabled.

### Offline

- If a page can't load and was never visited, the user sees the dedicated **`/offline`** page. It comes from the cache, has a **Retry connection** button and a live status.
- Pages and meal ideas you visited before still work offline.
- The online/offline indicator in the navbar pings the server. It doesn't rely only on `navigator.onLine`.
- When the connection returns, data is refetched automatically.

## Caching (TanStack Query)

- **Query keys:** `["exercises", uid, "list", { status, order }]`, `["exercises", uid, "detail", id]`, `["recipes", "list", { page, search }]` and `["recipes", "detail", id]`.
- **Expiration:** `staleTime` is 1 minute for exercises and 5 minutes for recipes. `gcTime` is 5 minutes. Data is refetched on window focus and when the connection comes back.
- **Invalidation:** after adding, completing or removing an exercise, the `["exercises", uid]` cache is invalidated. On logout, the whole cache is cleared.
- **Outdated requests:** `cancelQueries` runs before every change, and every response is stored under its own query key. So an old response can't overwrite newer data.
