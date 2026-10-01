import { useState } from "react";

function WorkoutItem({ exercise, onRemove, onStatusChange, onResetComponent }) {
  const [repetitions, setRepetitions] = useState(10);

  console.log("WorkoutItem rendered:", exercise.name);

  const increaseRepetitions = () => {
    setRepetitions(repetitions + 1);
  };

  const decreaseRepetitions = () => {
    if (repetitions > 0) {
      setRepetitions(repetitions - 1);
    }
  };

  const resetRepetitions = () => {
    setRepetitions(10);
  };

  return (
    <div className="workout-card">
      <div className="workout-info">
        <h3>{exercise.name}</h3>

        <p>
          <strong>Muscle:</strong> {exercise.muscle}
        </p>

        <p>
          <strong>Sets:</strong> {exercise.sets}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={`status ${exercise.status.replace(" ", "-").toLowerCase()}`}>
            {exercise.status}
          </span>
        </p>
      </div>

      <div className="workout-state">
        <h4>Repetitions: {repetitions}</h4>

        <button onClick={increaseRepetitions}>+</button>

        <button onClick={decreaseRepetitions}>-</button>

        <button onClick={resetRepetitions}>Reset</button>
      </div>

      <div className="workout-actions">
        {exercise.status !== "Completed" && (
          <button onClick={() => onStatusChange(exercise.id)}>
            Complete
          </button>
        )}

        <button onClick={() => onRemove(exercise.id)}>
          Remove
        </button>

        <button onClick={() => onResetComponent(exercise.id)}>
  Reset Component
</button>
      </div>
    </div>
  );
}

export default WorkoutItem;