
function FilterPanel({
  type,
  setType,
  remoteOnly,
  setRemoteOnly,
  sort,
  setSort,
  onReset,
}) {
  return (
    <section className="filter-panel">
      <div className="filter-group">
        <span className="filter-label">OPPORTUNITY</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All opportunities</option>
          <option value="internship">Internships</option>
          <option value="full_time">Full-time</option>
          <option value="contract">Contract</option>
          <option value="part_time">Part-time</option>
        </select>
      </div>

      <label className="remote-toggle">
        <input
          type="checkbox"
          checked={remoteOnly}
          onChange={(e) => setRemoteOnly(e.target.checked)}
        />
        <span>Remote only</span>
      </label>

      <div className="filter-group sort-group">
        <span className="filter-label">SORT BY</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Job title A–Z</option>
          <option value="company">Company A–Z</option>
        </select>
      </div>

      <button className="button button-ghost" onClick={onReset}>
        Reset filters ↺
      </button>
    </section>
  );
}

export default FilterPanel;
