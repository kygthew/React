import { Link } from "react-router";
import { stripHtml } from "../utils/jobUtils";

/** Side panel on the Jobs page (the former JobDetails component). */
function JobPreview({ job, saved, onToggleSave }) {
  if (!job) {
    return (
      <section className="details-panel details-empty">
        <span className="details-symbol">✳</span>
        <h2>Your next chapter starts here.</h2>
        <p>Select a vacancy to explore its details and application link.</p>
      </section>
    );
  }

  const description = stripHtml(job.description);
  const short = description.length > 700 ? `${description.slice(0, 700)}…` : description;

  return (
    <section className="details-panel">
      <div className="details-cover">
        <span>OPPORTUNITY SPOTLIGHT</span>
        <span className="cover-star">✳</span>
      </div>

      <div className="details-body">
        <div className="details-company-mark">{job.company.charAt(0).toUpperCase()}</div>

        <div className="details-heading">
          <div>
            <h2>{job.title}</h2>
            <p className="company-name">{job.company}</p>
          </div>
          <button
            className={`button button-ghost ${saved ? "is-saved" : ""}`}
            onClick={() => onToggleSave(job.id)}
          >
            {saved ? "♥ Saved" : "♡ Save"}
          </button>
        </div>

        <div className="details-meta">
          <span>⌖ {job.location}</span>
          <span>{job.remote ? "Remote" : "On-site / unspecified"}</span>
        </div>

        <div className="details-section">
          <h3>About this opportunity</h3>
          <p className="description-text">{short || "No description provided by the source."}</p>
        </div>

        <div className="details-section">
          <h3>Skills & tags</h3>
          <div className="tag-row">
            {job.tags.length > 0
              ? job.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)
              : <span className="muted">No tags provided</span>}
          </div>
        </div>

        <div className="preview-actions">
          <Link
            className="button button-primary apply-button"
            to={`/jobs/${encodeURIComponent(job.id)}`}
          >
            Open full details →
          </Link>
          {job.url && (
            <a className="button button-ghost apply-button" href={job.url} target="_blank" rel="noreferrer">
              View original vacancy ↗
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default JobPreview;
