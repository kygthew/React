// Online/offline status that is checked for real.


let online = typeof navigator === "undefined" ? true : navigator.onLine;
const listeners = new Set();

function set(value) {
  if (value === online) return;
  online = value;
  listeners.forEach((listener) => listener());
}

async function ping() {
  try {
    // .json is not cached by the service worker, so this really hits the server
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
function start() {
  if (started) return;
  started = true;
  window.addEventListener("online", checkConnection);
  window.addEventListener("offline", () => set(false));
  setInterval(() => {
    if (document.visibilityState === "visible") checkConnection();
  }, 30 * 1000);
  checkConnection();
}

export function subscribeToConnection(listener) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getIsOnline = () => online;
