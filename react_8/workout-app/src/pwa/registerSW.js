import { store } from "../store";
import { updateAvailable } from "../features/pwa/pwaSlice";

let waitingWorker = null;
let updateRequested = false;

function setWaiting(worker) {
  waitingWorker = worker;
  store.dispatch(updateAvailable());
}

export function applyUpdate() {
  if (!waitingWorker) return;
  updateRequested = true;
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
}

export function reportVisitedPage(url) {
  navigator.serviceWorker?.controller?.postMessage({ type: "PAGE_VISITED", url });
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!updateRequested) return;
    updateRequested = false;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaiting(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(worker);
          }
        });
      });

      setInterval(() => registration.update(), 60 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update();
      });
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}
