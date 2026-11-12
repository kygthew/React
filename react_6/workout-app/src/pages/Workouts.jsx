import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkoutList from "../components/workoutList";
import Loader from "../components/Loader";
import {
  useExercises,
  useAddExercise,
  useCompleteExercise,
  useDeleteExercise,
  useAddSampleExercises,
} from "../hooks/useExercises";

const FILTERS = ["All", "Planned", "In Progress", "Completed"];

function Workouts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "All";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";

  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState("");
  const [resetKeys, setResetKeys] = useState({});

  const { data: exercises = [], isPending, isError, error, isFetching, refetch } =
    useExercises({ status: filter, order });
  const addExercise = useAddExercise();
  const completeExercise = useCompleteExercise();
  const deleteExercise = useDeleteExercise();
  const addSamples = useAddSampleExercises();

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const setFilter = (value) => updateParams({ filter: value === "All" ? null : value });
  const reverseExercises = () => updateParams({ order: order === "asc" ? "desc" : null });

  const handleAdd = (event) => {
    event.preventDefault();
    if (newName.trim() === "" || newMuscle.trim() === "") return;

    addExercise.mutate(
      { name: newName.trim(), muscle: newMuscle.trim() },
      {
        onSuccess: () => {
          setNewName("");
          setNewMuscle("");
        },
      }
    );
  };

  const resetComponentState = (id) => {
    setResetKeys({ ...resetKeys, [id]: (resetKeys[id] || 0) + 1 });
  };

  const mutationError =
    addExercise.error || completeExercise.error || deleteExercise.error || addSamples.error;

  const renderList = () => {
    if (isPending) return <Loader text="Loading exercises..." />;

    if (isError) {
      return (
        <div className="state-box error-box">
          <p>Could not load exercises: {error.message}</p>
          <button onClick={() => refetch()}>Try again</button>
        </div>
      );
    }

    if (exercises.length === 0) {
      return (
        <div className="state-box">
          {filter === "All" ? (
            <>
              <p>You have no exercises yet. Add one above or start with examples.</p>
              <button onClick={() => addSamples.mutate()} disabled={addSamples.isPending}>
                {addSamples.isPending ? "Adding..." : "Add sample exercises"}
              </button>
            </>
          ) : (
            <p>No exercises with status "{filter}".</p>
          )}
        </div>
      );
    }

    return (
      <WorkoutList
        exercises={exercises}
        resetKeys={resetKeys}
        onRemove={(id) => deleteExercise.mutate(id)}
        onStatusChange={(id) => completeExercise.mutate(id)}
        onResetComponent={resetComponentState}
      />
    );
  };

  return (
    <section className="dashboard">
      <h2>
        Workouts {isFetching && !isPending && <small className="muted">updating…</small>}
      </h2>

      <form className="add-form" onSubmit={handleAdd}>
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
        <button type="submit" disabled={addExercise.isPending}>
          {addExercise.isPending ? "Adding..." : "+ Add Exercise"}
        </button>
      </form>

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
        <button onClick={reverseExercises}>
          Reverse List {order === "desc" ? "↑" : "↓"}
        </button>
      </div>

      {mutationError && <p className="error">Action failed: {mutationError.message}</p>}

      {renderList()}
    </section>
  );
}

export default Workouts;
