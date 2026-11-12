import { useParams, useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader";
import {
  useExercise,
  useCompleteExercise,
  useDeleteExercise,
} from "../hooks/useExercises";

function ExerciseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: exercise, isPending, isError, error, refetch } = useExercise(id);
  const completeExercise = useCompleteExercise();
  const deleteExercise = useDeleteExercise();

  if (isPending) return <Loader text="Loading exercise..." />;

  if (isError) {
    return (
      <section className="state-box error-box">
        <p>Could not load exercise: {error.message}</p>
        <button onClick={() => refetch()}>Try again</button>
      </section>
    );
  }

  if (!exercise) {
    return (
      <section>
        <h2>Exercise not found</h2>
        <Link to="/workouts">← Back to list</Link>
      </section>
    );
  }

  const remove = () => {
    navigate("/workouts", { replace: true });
    deleteExercise.mutate(exercise.id);
  };

  return (
    <section className="details">
      <h2>{exercise.name}</h2>
      <p><strong>Muscle:</strong> {exercise.muscle}</p>
      <p><strong>Sets:</strong> {exercise.sets}</p>
      <p>
        <strong>Status:</strong>{" "}
        <span className={`status ${exercise.status.replace(" ", "-").toLowerCase()}`}>
          {exercise.status}
        </span>
      </p>

      {completeExercise.error && (
        <p className="error">Action failed: {completeExercise.error.message}</p>
      )}

      <div className="workout-actions">
        {exercise.status !== "Completed" && (
          <button
            onClick={() => completeExercise.mutate(exercise.id)}
            disabled={completeExercise.isPending}
          >
            {completeExercise.isPending ? "Saving..." : "Complete"}
          </button>
        )}
        <button onClick={remove}>Remove</button>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    </section>
  );
}

export default ExerciseDetails;
