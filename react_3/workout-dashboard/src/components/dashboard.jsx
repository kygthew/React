import { useState } from "react";
import WorkoutList from "./woprkoutList";

function Dashboard() {
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: "Bench Press",
      muscle: "Chest",
      sets: 4,
      status: "Planned",
      resetKey: 0,
    },
    {
      id: 2,
      name: "Squats",
      muscle: "Legs",
      sets: 3,
      status: "In Progress",
      resetKey: 0,
    },
    {
      id: 3,
      name: "Pull Ups",
      muscle: "Back",
      sets: 3,
      status: "Completed",resetKey: 0,
    },
  ]);

  const [filter, setFilter] = useState("All");
  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState("");

  const removeExercise = (id) => {
    setExercises(
      exercises.filter((exercise) => exercise.id !== id)
    );
  };

  const changeStatus = (id) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id
          ? { ...exercise, status: "Completed" }
          : exercise
      )
    );
  };
  const addExercise = () => {
  if (newName.trim() === "" || newMuscle.trim() === "") {
    return;
  }

  const newExercise = {
    id: Date.now(),
    name: newName,
    muscle: newMuscle,
    sets: 3,
    status: "Planned",
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
          ? {
              ...exercise,
              resetKey: exercise.resetKey + 1,
            }
          : exercise
      )
    );
  };

  return (
    <main className="dashboard">
      <h1>Best Workout Dashboard</h1>

      <p className="subtitle">
        Manage your training exercises
      </p>

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

        <button onClick={addExercise}>
            + Add Exercise
        </button>
      </div>
      <div className="controls">
        <button onClick={() => setFilter("All")}>
          All
        </button>

        <button onClick={() => setFilter("Planned")}>
          Planned
        </button>

        <button onClick={() => setFilter("In Progress")}>
          In Progress
        </button>

        <button onClick={() => setFilter("Completed")}>
          Completed
        </button>

        <button onClick={reverseExercises}>
          Reverse List
        </button>
      </div>

      
        <WorkoutList
  exercises={exercises}
  filter={filter}
  onRemove={removeExercise}
  onStatusChange={changeStatus}
  onResetComponent={resetComponentState}
/>
     
    </main>
  );
}

export default Dashboard;