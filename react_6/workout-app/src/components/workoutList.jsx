import WorkoutItem from "./workoutItem";

function WorkoutList({ exercises, resetKeys, onRemove, onStatusChange, onResetComponent }) {
  return (
    <div className="workout-list">
      {exercises.map((exercise) => (
        <WorkoutItem
          key={`${exercise.id}-${resetKeys[exercise.id] || 0}`}
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
