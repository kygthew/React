import { useOnlineStatus, usePwaUpdate } from "../hooks/usePwa";

// Small dot + label in the navbar
export function ConnectionIndicator() {
  const online = useOnlineStatus();
  return (
    <span className={`connection ${online ? "is-online" : "is-offline"}`} role="status">
      <span className="connection-dot" aria-hidden="true" />
      {online ? "Online" : "Offline"}
    </span>
  );
}

// Strip under the navbar while offline
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="offline-banner" role="alert">
      You're offline. Saved pages and meal ideas still work; workouts need internet.
    </div>
  );
}

// "New version available" with a button that activates it
export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = usePwaUpdate();
  if (!updateAvailable) return null;
  return (
    <div className="update-banner" role="alert">
      <span>A new version of the app is available.</span>
      <button onClick={applyUpdate}>Update now</button>
    </div>
  );
}

// "You are viewing saved data" label for API results
export function CachedBadge({ fromCache, cachedAt }) {
  const online = useOnlineStatus();
  if (!fromCache && online) return null;

  const when = cachedAt
    ? new Date(cachedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <p className="cached-badge" role="status">
       Showing saved data{when ? ` from ${when}` : ""}. It may be out of date.
    </p>
  );
}
