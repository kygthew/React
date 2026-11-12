import StatePanel from "./StatePanel";

/** Suspense fallback while a lazy page chunk is downloading. */
function PageLoader() {
  return (
    <div className="page-content">
      <StatePanel spinner title="Loading page..." />
    </div>
  );
}

export default PageLoader;
