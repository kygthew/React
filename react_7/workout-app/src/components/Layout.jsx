import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reportVisitedPage } from "../pwa/registerSW";
import { ConnectionIndicator, OfflineBanner, UpdateBanner } from "./PwaStatus";

function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // On every page change: close the mobile menu and let the
  // service worker remember the page for offline reloads.
  useEffect(() => {
    setMenuOpen(false);
    reportVisitedPage(location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      // error message is stored in AuthContext
    }
  };

  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo-text">💪 Workout</Link>

        <ConnectionIndicator />

        {}
        <button
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav id="main-nav" className={menuOpen ? "open" : ""}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/workouts">Workouts</NavLink>
          <NavLink to="/recipes">Meals</NavLink>
          <NavLink to="/about">About</NavLink>

          {}
          {!loading &&
            (user ? (
              <>
                <NavLink to="/profile">Profile</NavLink>
                <button className="nav-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/signup">Signup</NavLink>
              </>
            ))}
        </nav>
      </header>

      <OfflineBanner />

      <main className="page">
        <Outlet />
      </main>

      <UpdateBanner />
    </>
  );
}

export default Layout;
