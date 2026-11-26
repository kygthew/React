import { useEffect, useRef } from "react";

export function useRefreshOnFocus(refresh) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshRef.current({ reconnect: false });
    };
    const onOnline = () => refreshRef.current({ reconnect: true });

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, []);
}
