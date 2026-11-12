import { Link, useRouteError } from "react-router";

/** Shown by the router if a page crashes while rendering. */
function RouteErrorPage() {
  const error = useRouteError();

  return (
    <div className="app-shell">
      <div className="page-content">
        <div className="state-panel">
          <h3>Something broke on this page</h3>
          <p>{error?.statusText || error?.message || "Unexpected error."}</p>
          <div className="state-actions">
            <Link className="button button-primary" to="/">Go home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteErrorPage;
