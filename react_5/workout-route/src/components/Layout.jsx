import { NavLink, Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <header className="navbar">
        <span className="logo-text">💪 Workout</span>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/workouts">Workouts</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
