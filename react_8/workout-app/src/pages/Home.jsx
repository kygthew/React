import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useExerciseStats } from "../hooks/useExercises";
import Loader from "../components/Loader";

// Stats come from a memoized selector over the same exercises as /workouts,
// so going between Home and Workouts doesn't trigger extra requests.
function Stats() {
  const { stats, isPending, isError } = useExerciseStats();

  if (isPending) return <Loader text="Loading stats..." />;
  if (isError && stats.total === 0) return <p className="error">Could not load stats.</p>;

  return (
    <div className="stats">
      <div className="stat">Total: <b>{stats.total}</b></div>
      <div className="stat">Planned: <b>{stats.planned}</b></div>
      <div className="stat">In Progress: <b>{stats.inProgress}</b></div>
      <div className="stat">Completed: <b>{stats.completed}</b></div>
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
