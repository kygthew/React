import { useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import JobList from "../components/JobList";
import JobPreview from "../components/JobPreview";
import Pagination from "../components/Pagination";
import StatePanel from "../components/StatePanel";
import { useJobs } from "../hooks/useJobs";
import { useJobFilters } from "../hooks/useJobFilters";
import { PAGE_SIZE, filterJobs, sortJobs } from "../utils/jobUtils";

function JobsPage() {
  const { jobs, loading, error, reload, savedIds, toggleSaved } = useJobs();
  const { filters, update, reset } = useJobFilters();
  const [selectedId, setSelectedId] = useState(null);

  const { q, type, remote, saved, sort } = filters;

  const filteredJobs = useMemo(
    () => sortJobs(filterJobs(jobs, { q, type, remote, saved }, savedIds), sort),
    [jobs, savedIds, q, type, remote, saved, sort]
  );

  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const currentPage = Math.min(filters.page, Math.max(1, totalPages));
  const visibleJobs = filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedJob =
    visibleJobs.find((job) => job.id === selectedId) ?? visibleJobs[0] ?? null;

  function changePage(page) {
    update({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page-content">
      <section className="page-header">
        <span className="eyebrow">THE OPPORTUNITY BOARD</span>
        <div className="section-heading">
          <h1 className="page-title">
            Explore opportunities<span className="brand-dot">.</span>
          </h1>
          <button
            className={`button ${filters.saved ? "button-primary" : "button-ghost"}`}
            onClick={() => update({ saved: !filters.saved })}
          >
            {filters.saved ? "♥ Saved jobs" : "♡ View saved"}
          </button>
        </div>

        <SearchBar
          value={filters.q}
          onChange={(value) => update({ q: value }, { replace: true })}
        />
      </section>

      <section className="results-section">
        <FilterPanel
          type={filters.type}
          setType={(value) => update({ type: value })}
          remoteOnly={filters.remote}
          setRemoteOnly={(value) => update({ remote: value })}
          sort={filters.sort}
          setSort={(value) => update({ sort: value })}
          onReset={reset}
        />

        {loading ? (
          <StatePanel spinner title="Finding your next opportunity..." text="Loading live job listings." />
        ) : error ? (
          <StatePanel title="Something went wrong" text={error}>
            <button className="button button-primary" onClick={reload}>Try again</button>
          </StatePanel>
        ) : (
          <>
            <div className="results-count">
              <span><strong>{filteredJobs.length}</strong> opportunities found</span>
              <span>
                Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredJobs.length)}
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <StatePanel
                title={filters.saved ? "No saved jobs yet" : "No opportunities found"}
                text={filters.saved
                  ? "Tap ♡ on any vacancy to keep it here."
                  : "Try different keywords or reset the filters."}
              >
                <button className="button button-primary" onClick={reset}>Clear all filters</button>
              </StatePanel>
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
                  <Pagination page={currentPage} totalPages={totalPages} onPageChange={changePage} />
                </div>

                <JobPreview
                  job={selectedJob}
                  saved={selectedJob ? savedIds.includes(selectedJob.id) : false}
                  onToggleSave={toggleSaved}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default JobsPage;
