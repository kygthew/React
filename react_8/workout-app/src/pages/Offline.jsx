import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOnlineStatus, checkConnection } from "../hooks/usePwa";

// In-app version of the offline page (route /offline).
// When the whole app can't load, the service worker serves public/offline.html instead.
function Offline() {
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const retry = async () => {
    setChecking(true);
    const ok = await checkConnection();
    setChecking(false);
    if (ok) navigate(-1);
  };

  return (
    <section className="offline-page">
      <div className="offline-icon" aria-hidden="true">📡</div>
      <h1>{online ? "You're back online" : "You're offline"}</h1>
      <p>
        {online
          ? "The connection is back. You can continue where you left off."
          : "Check your Wi-Fi or mobile data. Pages and meal ideas you opened before still work."}
      </p>

      <span className={`connection ${online ? "is-online" : "is-offline"}`}>
        <span className="connection-dot" aria-hidden="true" />
        {online ? "Online" : "Offline"}
      </span>

      <div className="offline-actions">
        <button onClick={retry} disabled={checking}>
          {checking ? "Checking..." : "Retry connection"}
        </button>
        <Link to="/recipes" className="btn-link">Open saved meal ideas</Link>
      </div>
    </section>
  );
}

export default Offline;
