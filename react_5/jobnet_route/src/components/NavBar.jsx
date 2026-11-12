import { Link, NavLink } from "react-router";
import { useJobs } from "../hooks/useJobs";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/jobs", label: "Jobs" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

function NavBar({ onAddClick }) {
  const { savedIds } = useJobs();

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand-icon">✳</span>
        <span>JobNet<span className="brand-dot">.</span></span>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-right">
        <button className="button button-primary" onClick={onAddClick}>
          + Add a job
        </button>
        <Link className="saved-count" to="/jobs?saved=1" title="Saved jobs">
          ♡ {savedIds.length}
        </Link>
        <NavLink
          to="/login"
          className={({ isActive }) => `button button-ghost ${isActive ? "nav-login-active" : ""}`}
        >
          Log in
        </NavLink>
      </div>
    </header>
  );
}

export default NavBar;
