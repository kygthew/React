import { useSyncExternalStore } from "react";
import { subscribeToUpdate, isUpdateAvailable, applyUpdate } from "../pwa/registerSW";
import { subscribeToConnection, getIsOnline, checkConnection } from "../pwa/connectivity";

// true / false — updates automatically when the connection changes
export function useOnlineStatus() {
  return useSyncExternalStore(subscribeToConnection, getIsOnline, () => true);
}

export { checkConnection };

// { updateAvailable, applyUpdate } — for the "new version" banner
export function usePwaUpdate() {
  const updateAvailable = useSyncExternalStore(subscribeToUpdate, isUpdateAvailable, () => false);
  return { updateAvailable, applyUpdate };
}
