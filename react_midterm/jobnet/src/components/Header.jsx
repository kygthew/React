
function Header({ onAddClick, savedCount }) {
  return (
    <header className="topbar">
      <a className="brand" href="#" onClick={(e) => e.preventDefault()}>
        <span className="brand-icon">✳</span>
        <span>JobNet<span className="brand-dot">.</span></span>
      </a>

      <div className="topbar-right">
        <span className="live-label">
          <span className="live-dot" />
          Career discovery
        </span>
        <button className="button button-primary" onClick={onAddClick}>
          + Add a job
        </button>
        <span className="saved-count">♡ {savedCount}</span>
      </div>
    </header>
  );
}

export default Header;
