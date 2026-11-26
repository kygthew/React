import WorkoutItem from "./workoutItem";

function WorkoutList({ exercises, resetKeys, onRemove, onStatusChange, onResetComponent, disabled }) {
  return (
    <div className="workout-list">
      {exercises.map((exercise) => (
        <WorkoutItem

          key={`${exercise.id}-${resetKeys[exercise.id] || 0}`}
          exercise={exercise}
          onRemove={onRemove}
          onStatusChange={onStatusChange}
          onResetComponent={onResetComponent}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default WorkoutList;
