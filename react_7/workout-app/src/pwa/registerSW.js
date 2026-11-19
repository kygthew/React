// Registers the service worker and tracks "a new version is waiting".
// Components read the state with usePwaUpdate() (see hooks below).

let waitingWorker = null;
let updateRequested = false;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

function setWaiting(worker) {
  waitingWorker = worker;
  notify();
}

export function subscribeToUpdate(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const isUpdateAvailable = () => waitingWorker !== null;

// Called by the "Update" button: activate the waiting service worker.
// When it takes control, "controllerchange" fires and we reload once.
export function applyUpdate() {
  if (!waitingWorker) return;
  updateRequested = true;
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
}

// Tell the service worker which page is open, so it can be reopened offline.
export function reportVisitedPage(url) {
  navigator.serviceWorker?.controller?.postMessage({ type: "PAGE_VISITED", url });
}

export function registerServiceWorker() {
  // In `npm run dev` the SW is off — otherwise it would cache dev files.
  // Test it with `npm run build && npm run preview`.
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // Only reload after the user asked for the update
    // (the very first install also fires controllerchange).
    if (!updateRequested) return;
    updateRequested = false;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      // A new version already installed and waiting (e.g. from a previous visit)
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaiting(registration.waiting);
      }

      // A new version is being installed right now
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(worker);
          }
        });
      });

      // Check for a new version every hour and whenever the tab becomes visible
      setInterval(() => registration.update(), 60 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update();
      });
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}
