import { useSelector } from "react-redux";
import { selectIsOnline, selectUpdateAvailable } from "../features/pwa/pwaSlice";
import { applyUpdate } from "../pwa/registerSW";
import { checkConnection } from "../pwa/connectivity";

export function useOnlineStatus() {
  return useSelector(selectIsOnline);
}

export { checkConnection };

export function usePwaUpdate() {
  const updateAvailable = useSelector(selectUpdateAvailable);
  return { updateAvailable, applyUpdate };
}
