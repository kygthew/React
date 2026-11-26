# Workout Dashboard

A React app for planning workouts and finding meal ideas. It is an **installable PWA** that works offline.

It is built with React Router, Firebase Authentication (Email/Password and Google), Firestore, **Redux Toolkit** and a hand-written Service Worker.

## Features

- Sign up, log in, Google sign-in and logout. The session stays after a page refresh.
- Protected routes `/workouts`, `/workouts/:id` and `/profile`. Guests are redirected to `/login`.
- Workouts:
  - add, complete and remove exercises;
  - filter with `?filter=` and reverse the order with `?order=desc`.
- Meal ideas (public API, [dummyjson recipes](https://dummyjson.com/docs/recipes)):
  - `/recipes` has debounced search (`?q=`) and pagination (`?page=`);
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

## State management (Redux Toolkit)

### Store and structure

`src/store/index.js` creates the store with `configureStore`. `<Provider store={store}>` wraps the app in `main.jsx`.

```
src/
  store/         index.js (configureStore), actions.js (shared userLoggedOut action)
  features/      one folder per slice: slice + thunks + selectors
    exercises/   exercisesSlice.js, exercisesThunks.js, exercisesSelectors.js
    recipes/     recipesSlice.js, recipesThunks.js, recipesSelectors.js
    pwa/         pwaSlice.js
  services/      API calls only (Firestore, dummyjson) — no Redux here
  hooks/         custom hooks: the only place components get Redux data from
                 (useSelector / useDispatch live here)
  components/, pages/   UI only
```

**What is NOT in Redux:**
- **Authentication** stays in `AuthContext`. Firebase already manages the session, and the context only exposes it.
- **Temporary UI state** stays local in components, for example form inputs, the open/closed mobile menu, the search text while typing and the "Reset Component" keys.
- **URL state** stays in the URL: filter, order, page and search. It is read with `useSearchParams`, so links and page reloads keep it.

### Slices

| Slice | What it stores | Why it's global |
|---|---|---|
| `exercises` | the user's workouts, normalized with `createEntityAdapter`; list status; details status per id; status of each mutation | used by Home (stats), Workouts and details pages |
| `recipes` | recipes normalized by id; each `search + page` stored as a list of ids; details status per id | the list, details pages and pagination share the same data |
| `pwa` | `online` and `updateAvailable` | used by the navbar indicator, banners and the Workouts page |

Each item is stored **once**. Pages keep only ids, and lists, details and stats all read the same entities. This means there is no duplicated state.

### Async thunks (`createAsyncThunk`)

| Thunk | Type |
|---|---|
| `fetchExercises` | list fetching. Loads all of the user's exercises once; filtering and sorting happen in selectors |
| `fetchExerciseById` | details fetching |
| `addExercise`, `completeExercise`, `deleteExercise`, `addSampleExercises` | mutations. Each one refetches the list after it finishes ("refresh affected data") |
| `fetchRecipes` | list fetching for one page of the public API, with search |
| `fetchRecipeById` | details fetching |

The `pending`, `fulfilled` and `rejected` actions are handled in `extraReducers`. They set `status` (`idle`, `loading`, `succeeded` or `failed`) and `error`.

- **Loading, error and empty states:** pages show a spinner while loading, an error with a "Try again" button (this is the **retry**, a forced refetch), or an empty message.
- **No unnecessary requests:** each thunk has a `condition`. It skips the request if the data is still fresh (1 minute for exercises, 5 minutes for recipes) or if the same request is already running. For example, going from Home to Workouts or back to a page you already opened sends no request.
- **Stale requests:**
  - Every `pending` saves `action.meta.requestId`. `fulfilled` and `rejected` ignore answers whose id is not the latest.
  - When a mutation starts, any list request already in progress is marked as stale.
  - When you switch page or search, the old recipes request is cancelled with `abort()`.
  - Each page and search is stored under its own key, so an old answer can't replace the current one.
- **Optimistic updates:** "Complete" and "Remove" update the UI in `pending`. If the server fails, the refetch that follows undoes the change.
- **Logout:** the `auth/userLoggedOut` action resets the `exercises` slice, so private data never stays in memory.
- **Refresh:** data is reloaded when you return to the tab or when the internet comes back.

### Selectors

Memoized selectors return the same object until their inputs change, so components don't re-render on unrelated store updates.

### PWA and offline with Redux

The Service Worker did not change. Thunks run even when offline, so the SW can answer from its cache. When an answer comes from the cache, `fromCache` is stored in the slice, and the UI shows *"Showing saved data"*.
