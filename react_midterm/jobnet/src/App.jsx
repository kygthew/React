
import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import JobForm from "./components/JobForm";
import Pagination from "./components/Pagin";
import { fetchJobs } from "./services/jobApi";
import "./App.css";

const PAGE_SIZE = 6;

function App() {
  const [jobs, setJobs] = useState([]);

useEffect(() => {
  localStorage.setItem("userJobs", JSON.stringify(jobs));
}, [jobs]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jobnest-saved") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchJobs(controller.signal);

        if (!controller.signal.aborted) {
          setJobs(data);
          setSelectedId((current) => current ?? data[0]?.id ?? null);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError("We couldn't load the vacancies. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    localStorage.setItem("jobnest-saved", JSON.stringify(savedIds));
  }, [savedIds]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const text = `${job.title} ${job.company} ${job.location} ${job.tags.join(" ")}`.toLowerCase();
      const matchesQuery = text.includes(query.trim().toLowerCase());

      const normalizedTypes = job.types.map((item) =>
        item.toLowerCase().replace(/-/g, "_")
      );

      const isInternship =
        normalizedTypes.some((item) => item.includes("intern")) ||
        /intern|internship|trainee|graduate/i.test(job.title);

      const matchesType =
        type === "all" ||
        (type === "internship" && isInternship) ||
        (type !== "internship" && normalizedTypes.includes(type));

      const matchesRemote = !remoteOnly || job.remote;
      const matchesSaved = !showSavedOnly || savedIds.includes(job.id);

      return matchesQuery && matchesType && matchesRemote && matchesSaved;
    });

    result = [...result].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "company") return a.company.localeCompare(b.company);
      if (sort === "oldest") return a.createdAt - b.createdAt;
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [jobs, query, type, remoteOnly, sort, showSavedOnly, savedIds]);

  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, totalPages));

  const visibleJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const selectedJob =
    filteredJobs.find((job) => job.id === selectedId) ?? visibleJobs[0] ?? null;

    
  function resetFilters() {
    setQuery("");
    setType("all");
    setRemoteOnly(false);
    setSort("newest");
    setShowSavedOnly(false);
    setPage(1);
  }

  function toggleSaved(id) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function addJob(job) {
    setJobs((current) => [job, ...current]);
    setSelectedId(job.id);
    setShowSavedOnly(false);
    setQuery("");
    setType("all");
    setRemoteOnly(false);
    setPage(1);
  }

  return (
    <div className="app-shell">
      <Header
        onAddClick={() => setShowForm(true)}
        savedCount={savedIds.length}
      />

      <main className="page-content">
        <section className="hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />

          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            Find work that feels
            <br />
            <span>like your future.</span>
          </h1>
          <p>
            Discover internships and opportunities from companies around the world.
          </p>

          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
          />

          <div className="hero-note">
            <span className="live-dot" />
            Fresh opportunities. New possibilities.
          </div>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE OPPORTUNITY BOARD</span>
              <h2>Explore opportunities<span className="brand-dot">.</span></h2>
            </div>

            <button
              className={`button ${showSavedOnly ? "button-primary" : "button-ghost"}`}
              onClick={() => {
                setShowSavedOnly((value) => !value);
                setPage(1);
              }}
            >
              {showSavedOnly ? "♥ Saved jobs" : "♡ View saved"}
            </button>
          </div>

          <FilterPanel
            type={type}
            setType={(value) => {
              setType(value);
              setPage(1);
            }}
            remoteOnly={remoteOnly}
            setRemoteOnly={(value) => {
              setRemoteOnly(value);
              setPage(1);
            }}
            sort={sort}
            setSort={(value) => {
              setSort(value);
              setPage(1);
            }}
            onReset={resetFilters}
          />

          {loading ? (
            <div className="state-panel">
              <div className="spinner" />
              <h3>Finding your next opportunity...</h3>
              <p>Loading live job listings.</p>
            </div>
          ) : error ? (
            <div className="state-panel error-panel">
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className="button button-primary" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="results-count">
                <span><strong>{filteredJobs.length}</strong> opportunities found</span>
                <span>Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredJobs.length)}</span>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="state-panel">
                  <h3>No opportunities found</h3>
                  <p>Try different keywords or reset the filters.</p>
                  <button className="button button-primary" onClick={resetFilters}>
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="workspace">
                  <div className="list-column">
                    <JobList
                      jobs={visibleJobs}
                      selectedId={selectedJob?.id}
                      savedIds={savedIds}
                      onSelect={(job) => setSelectedId(job.id)}
                      onToggleSave={toggleSaved}
                    />
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>

                  <JobDetails
                    job={selectedJob}
                    saved={selectedJob ? savedIds.includes(selectedJob.id) : false}
                    onToggleSave={toggleSaved}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>✳ JobNet</span>
        <span>Built to help your next chapter begin.</span>
      </footer>

      {showForm && (
        <JobForm onAdd={addJob} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

export default App;
