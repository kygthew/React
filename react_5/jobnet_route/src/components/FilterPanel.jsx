import { SORT_OPTIONS, TYPE_OPTIONS } from "../utils/jobUtils";

function FilterPanel({ type, setType, remoteOnly, setRemoteOnly, sort, setSort, onReset }) {
  return (
    <section className="filter-panel">
      <div className="filter-group">
        <span className="filter-label">OPPORTUNITY</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
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
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <button className="button button-ghost" onClick={onReset}>
        Reset filters ↺
      </button>
    </section>
  );
}

export default FilterPanel;
