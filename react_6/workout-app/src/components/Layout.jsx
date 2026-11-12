import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
    }
  };

  return (
    <>
      <header className="navbar">
        <span className="logo-text">💪 Workout</span>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/workouts">Workouts</NavLink>
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

      <main className="page">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
