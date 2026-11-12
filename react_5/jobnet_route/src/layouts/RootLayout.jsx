import { Suspense, useCallback, useState } from "react";
import { Outlet, ScrollRestoration, useNavigate } from "react-router";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import JobForm from "../components/JobForm";
import PageLoader from "../components/PageLoader";
import { useJobs } from "../hooks/useJobs";

function RootLayout() {
  const [showForm, setShowForm] = useState(false);
  const { addJob } = useJobs();
  const navigate = useNavigate();

  const closeForm = useCallback(() => setShowForm(false), []);

  function handleAdd(job) {
    addJob(job);
    setShowForm(false);
    navigate(`/jobs/${job.id}`);
  }

  return (
    <div className="app-shell">
      <NavBar onAddClick={() => setShowForm(true)} />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />

      {showForm && <JobForm onAdd={handleAdd} onClose={closeForm} />}
      <ScrollRestoration />
    </div>
  );
}

export default RootLayout;
