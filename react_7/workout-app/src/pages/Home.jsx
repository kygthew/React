import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useExercises } from "../hooks/useExercises";
import Loader from "../components/Loader";

function Stats() {
  const { data: exercises = [], isPending, isError } = useExercises();

  if (isPending) return <Loader text="Loading stats..." />;
  if (isError) return <p className="error">Could not load stats.</p>;

  const count = (status) => exercises.filter((e) => e.status === status).length;

  return (
    <div className="stats">
      <div className="stat">Total: <b>{exercises.length}</b></div>
      <div className="stat">Planned: <b>{count("Planned")}</b></div>
      <div className="stat">In Progress: <b>{count("In Progress")}</b></div>
      <div className="stat">Completed: <b>{count("Completed")}</b></div>
    </div>
  );
}

function Home() {
  const { user, loading } = useAuth();

  return (
    <section>
      <h1>Best Workout Dashboard</h1>
      <p className="subtitle">Manage your training exercises</p>

      {loading ? (
        <Loader />
      ) : user ? (
        <>
          <Stats />
          <Link to="/workouts" className="btn-link">Go to workouts →</Link>
        </>
      ) : (
        <div className="stats">
          <Link to="/login" className="btn-link">Login</Link>
          <Link to="/signup" className="btn-link">Create account</Link>
        </div>
      )}
    </section>
  );
}

export default Home;
