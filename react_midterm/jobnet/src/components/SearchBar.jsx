
function SearchBar({ value, onChange }) {
  return (
    <label className="search-box">
      <span className="search-icon">⌕</span>
      <input
        type="search"
        placeholder="Job title, company, or skill..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search jobs"
      />
      <span className="search-shortcut">SEARCH</span>
    </label>
  );
}

export default SearchBar;
