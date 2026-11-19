import WorkoutItem from "./workoutItem";

// Filtering now happens on the server (see useExercises), so the list just renders.
function WorkoutList({ exercises, resetKeys, onRemove, onStatusChange, onResetComponent, disabled }) {
  return (
    <div className="workout-list">
      {exercises.map((exercise) => (
        <WorkoutItem
          // changing resetKey changes the key → React remounts the card and resets its state
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
