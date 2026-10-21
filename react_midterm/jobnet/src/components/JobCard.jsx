

function JobCard({ job, selected, saved, onSelect, onToggleSave }) {
  const date = job.createdAt
    ? new Date(job.createdAt * 1000).toLocaleDateString()
    : "Date unavailable";

  return (
    <article className={`job-card ${selected ? "job-card-selected" : ""}`}>
      <button className="job-card-main" onClick={() => onSelect(job)}>
        <div className="company-mark">
          {(job.company || "?").charAt(0).toUpperCase()}
        </div>

        <div className="job-card-content">
          <div className="job-card-top">
            <h3>{job.title}</h3>
            {job.remote && <span className="tag tag-mint">REMOTE</span>}
          </div>

          <p className="company-name">{job.company}</p>

          <div className="job-meta">
            <span>⌖ {job.location}</span>
            <span>◷ {date}</span>
          </div>

          <div className="tag-row">
            {job.tags.slice(0, 3).map((tag) => (
              <span className="tag" key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </button>

      <button
        className={`save-button ${saved ? "is-saved" : ""}`}
        onClick={() => onToggleSave(job.id)}
        aria-label={saved ? "Remove saved job" : "Save job"}
        title={saved ? "Remove from saved" : "Save job"}
      >
        {saved ? "♥" : "♡"}
      </button>
    </article>
  );
}

export default JobCard;
