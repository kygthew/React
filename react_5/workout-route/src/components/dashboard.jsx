import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkoutList from "./workoutList";

const FILTERS = ["All", "Planned", "In Progress", "Completed"];

function Dashboard({ exercises, setExercises }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "All";

  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState("");

  const setFilter = (value) => {
    if (value === "All") setSearchParams({});
    else setSearchParams({ filter: value });
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
  };

  const changeStatus = (id) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, status: "Completed" } : exercise
      )
    );
  };

  const addExercise = () => {
    if (newName.trim() === "" || newMuscle.trim() === "") return;

    const newExercise = {
      id: Date.now(),
      name: newName,
      muscle: newMuscle,
      sets: 3,
      status: "Planned",
      resetKey: 0,
    };

    setExercises([...exercises, newExercise]);
    setNewName("");
    setNewMuscle("");
  };

  const reverseExercises = () => {
    setExercises([...exercises].reverse());
  };

  const resetComponentState = (id) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id
          ? { ...exercise, resetKey: exercise.resetKey + 1 }
          : exercise
      )
    );
  };

  return (
    <section className="dashboard">
      <h2>Workouts</h2>

      <div className="add-form">
        <input
          type="text"
          placeholder="Exercise name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
        <input
          type="text"
          placeholder="Muscle group"
          value={newMuscle}
          onChange={(event) => setNewMuscle(event.target.value)}
        />
        <button onClick={addExercise}>+ Add Exercise</button>
      </div>

      <div className="controls">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <button onClick={reverseExercises}>Reverse List</button>
      </div>

      <WorkoutList
        exercises={exercises}
        filter={filter}
        onRemove={removeExercise}
        onStatusChange={changeStatus}
        onResetComponent={resetComponentState}
      />
    </section>
  );
}

export default Dashboard;
