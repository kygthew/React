# Workout Dashboard

A React app for planning workouts. It uses React Router, Firebase Authentication (Email/Password and Google), Firestore and TanStack Query.

**Live demo:** _add your deployed link here_

## Features

- Sign up, log in, Google sign-in and logout. The session stays after a page refresh.
- Protected routes: `/workouts`, `/workouts/:id` and `/profile`. Guests are redirected to `/login`.
- The navbar shows Login/Signup or Profile/Logout, depending on whether you are signed in.
- Exercises: add, complete, remove, filter (`?filter=`) and reverse order (`?order=desc`).

## Setup

```bash
npm install
cp .env.example .env.local 
npm run dev
```

In Firebase:

1. Enable **Email/Password** and **Google** sign-in.
2. Create a **Firestore** database and paste the rules from `firestore.rules`.

## Caching strategy

Server data is cached with **TanStack Query**.

- **Query keys:** `["exercises", uid, "list", { status, order }]` and `["exercises", uid, "detail", id]`. Each user and each filter has its own cache entry.
- **Expiration:** `staleTime` is 1 minute and `gcTime` is 5 minutes. Data is also refetched when you return to the browser tab.
- **Invalidation:** after adding, completing or removing an exercise, the whole `["exercises", uid]` cache is invalidated. On logout, the cache is cleared.
- **Outdated requests:** `cancelQueries` runs before each change, so an old response can't overwrite newer data.