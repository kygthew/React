import { Link } from "react-router-dom";

function Home({ exercises }) {
  const count = (status) => exercises.filter((e) => e.status === status).length;

  return (
    <section>
      <h1>Best Workout Dashboard</h1>
      <p className="subtitle">Manage your training exercises</p>

      <div className="stats">
        <div className="stat">All: <b>{exercises.length}</b></div>
        <div className="stat">Planned: <b>{count("Planned")}</b></div>
        <div className="stat">In Progress: <b>{count("In Progress")}</b></div>
        <div className="stat">Completed: <b>{count("Completed")}</b></div>
      </div>

      <Link to="/workouts" className="btn-link">GO to Workouts →</Link>
    </section>
  );
}

export default Home;
