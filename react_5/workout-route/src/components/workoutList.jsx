import WorkoutItem from "./workoutItem";

function WorkoutList({ exercises, filter, onRemove, onStatusChange, onResetComponent }) {
  const visible = exercises.filter(
    (exercise) => filter === "All" || exercise.status === filter
  );

  if (visible.length === 0) {
    return <p>Нет упражнений с таким статусом.</p>;
  }

  return (
    <div className="workout-list">
      {visible.map((exercise) => (
        <WorkoutItem
          key={`${exercise.id}-${exercise.resetKey}`}
          exercise={exercise}
          onRemove={onRemove}
          onStatusChange={onStatusChange}
          onResetComponent={onResetComponent}
        />
      ))}
    </div>
  );
}

export default WorkoutList;
