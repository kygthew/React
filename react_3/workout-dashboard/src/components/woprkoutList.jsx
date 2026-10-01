import WorkoutItem from "./workoutItem";

function WorkoutList({
  exercises,
  filter,
  onRemove,
  onStatusChange,
  onResetComponent,
}) {
  return (
    <div className="workout-list">
      {exercises.map((exercise) => {
        const isVisible =
          filter === "All" || exercise.status === filter;

        return (
          <div
            style={{
              display: isVisible ? "block" : "none",
           }}
          >
          <WorkoutItem
            key={`${exercise.id}-${exercise.resetKey}`}
            exercise={exercise}
            resetKey={exercise.resetKey}
            onRemove={onRemove}
            onStatusChange={onStatusChange}
            onResetComponent={onResetComponent
            }
          />
          </div>
        );
      })}
    </div>
  );
}

export default WorkoutList;