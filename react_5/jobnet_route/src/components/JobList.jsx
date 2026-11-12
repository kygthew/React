
import JobCard from "./JobCard";

function JobList({ jobs, selectedId, savedIds, onSelect, onToggleSave }) {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">⌕</span>
        <h3>No matching opportunities</h3>
        <p>Try another search or reset your filters.</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          selected={job.id === selectedId}
          saved={savedIds.includes(job.id)}
          onSelect={onSelect}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

export default JobList;
