import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import StatePanel from "../components/StatePanel";
import { useJobs } from "../hooks/useJobs";
import { fetchJobById } from "../services/service";
import { daysAgo, formatDate, stripHtml, typeLabel } from "../utils/jobUtils";

function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { customJobs, savedIds, toggleSaved } = useJobs();
  const [retryKey, setRetryKey] = useState(0);

  // Result is stored together with the id it belongs to, so a slow
  // response for a previous id can never be shown for the current one.
  const [result, setResult] = useState({ id: null, status: "loading", job: null });

  const isCustom = id.startsWith("custom-");
  const customJob = isCustom ? customJobs.find((job) => job.id === id) : null;

  useEffect(() => {
    if (isCustom) return undefined;

    const controller = new AbortController();

    fetchJobById(id, controller.signal)
      .then((job) => {
        if (controller.signal.aborted) return;
        setResult({ id, status: job ? "ready" : "missing", job });
      })
      .catch((err) => {
        if (err.name === "AbortError" || controller.signal.aborted) return;
        setResult({ id, status: "error", job: null });
      });

    // Cancels the stale request when the id changes or the page unmounts.
    return () => controller.abort();
  }, [id, isCustom, retryKey]);

  let status;
  let job;
  if (isCustom) {
    job = customJob;
    status = customJob ? "ready" : "missing";
  } else if (result.id === id) {
    ({ status, job } = result);
  } else {
    status = "loading";
  }

  function goBack() {
    // location.key is "default" when the page was opened directly (no history)
    if (location.key !== "default") navigate(-1);
    else navigate("/jobs");
  }

  const backLinks = (
    <div className="details-nav">
      <button className="button button-ghost" onClick={goBack}>← Back</button>
      <Link className="button button-ghost" to="/jobs">All jobs</Link>
    </div>
  );

  if (status === "loading") {
    return (
      <div className="page-content">
        {backLinks}
        <StatePanel spinner title="Loading vacancy..." text="Fetching the vacancy from the API." />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-content">
        {backLinks}
        <StatePanel title="Something went wrong" text="We couldn't load this vacancy. Check your connection and try again.">
          <button
            className="button button-primary"
            onClick={() => {
              setResult({ id: null, status: "loading", job: null });
              setRetryKey((key) => key + 1);
            }}
          >
            Try again
          </button>
        </StatePanel>
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="page-content">
        {backLinks}
        <StatePanel
          title="Vacancy not found"
          text={`There is no vacancy with id “${id}”. It may have been closed or the link is wrong.`}
        >
          <Link className="button button-primary" to="/jobs">Browse all jobs</Link>
          <Link className="button button-ghost" to="/">Go home</Link>
        </StatePanel>
      </div>
    );
  }

  const saved = savedIds.includes(job.id);
  const description = stripHtml(job.description);

  const facts = [
    { label: "Company", value: job.company },
    { label: "Location", value: job.location },
    { label: "Work mode", value: job.remote ? "Remote" : "On-site / unspecified" },
    { label: "Job type", value: job.types.length ? job.types.map(typeLabel).join(", ") : "Not specified" },
    { label: "Posted", value: `${formatDate(job.createdAt)}${job.createdAt ? ` · ${daysAgo(job.createdAt)}` : ""}` },
    { label: "Source", value: job.custom ? "Added by you" : "Arbeitnow API" },
    { label: "Vacancy ID", value: job.id },
  ];

  return (
    <div className="page-content">
      {backLinks}

      <article className="details-page">
        <div className="details-panel details-panel-static">
          <div className="details-cover">
            <span>OPPORTUNITY SPOTLIGHT</span>
            <span className="cover-star">✳</span>
          </div>

          <div className="details-body">
            <div className="details-company-mark">{job.company.charAt(0).toUpperCase()}</div>

            <div className="details-heading">
              <div>
                <h1 className="details-title">{job.title}</h1>
                <p className="company-name">{job.company}</p>
              </div>
              <button
                className={`button button-ghost ${saved ? "is-saved" : ""}`}
                onClick={() => toggleSaved(job.id)}
              >
                {saved ? "♥ Saved" : "♡ Save"}
              </button>
            </div>

            <div className="details-section">
              <h3>About this opportunity</h3>
              <p className="description-text">{description || "No description provided by the source."}</p>
            </div>
          </div>
        </div>

        <aside className="details-side">
          <div className="facts-card">
            <h3>Key details</h3>
            <dl className="facts-list">
              {facts.map((fact) => (
                <div className="fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="facts-card">
            <h3>Skills & tags</h3>
            <div className="tag-row">
              {job.tags.length > 0
                ? job.tags.map((tag) => (
                    <Link className="tag tag-link" key={tag} to={`/jobs?q=${encodeURIComponent(tag)}`}>
                      {tag}
                    </Link>
                  ))
                : <span className="muted">No tags provided</span>}
            </div>
          </div>

          {job.url && (
            <a className="button button-primary apply-button" href={job.url} target="_blank" rel="noreferrer">
              Apply on original site ↗
            </a>
          )}
        </aside>
      </article>
    </div>
  );
}

export default JobDetailsPage;
