import { useParams, useNavigate, Link } from "react-router-dom";

function ExerciseDetails({ exercises, setExercises }) {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const exercise = exercises.find((e) => e.id === Number(id));

  if (!exercise) {
    return (
      <section>
        <h2>Excercise not found</h2>
        <Link to="/workouts">← Назад к списку</Link>
      </section>
    );
  }

  const complete = () => {
    setExercises(
      exercises.map((e) => (e.id === exercise.id ? { ...e, status: "Completed" } : e))
    );
  };

  const remove = () => {
    setExercises(exercises.filter((e) => e.id !== exercise.id));
    navigate("/workouts"); 
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

      <div className="workout-actions">
        {exercise.status !== "Completed" && <button onClick={complete}>Complete</button>}
        <button onClick={remove}>Remove</button>
        <button onClick={() => navigate(-1)}>← Назад</button>
      </div>
    </section>
  );
}

export default ExerciseDetails;
