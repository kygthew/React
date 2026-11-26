import { store } from "../store";
import { connectionChanged } from "../features/pwa/pwaSlice";

function set(value) {
  if (store.getState().pwa.online !== value) store.dispatch(connectionChanged(value));
}

async function ping() {
  try {
    const response = await fetch(`/manifest.json?ping=${Date.now()}`, {
      cache: "no-store",
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkConnection() {
  if (!navigator.onLine) {
    set(false);
    return false;
  }
  const result = await ping();
  set(result);
  return result;
}

let started = false;
export function startConnectivityMonitor() {
  if (started) return;
  started = true;
  window.addEventListener("online", checkConnection);
  window.addEventListener("offline", () => set(false));
  setInterval(() => {
    if (document.visibilityState === "visible") checkConnection();
  }, 30 * 1000);
  checkConnection();
}
