import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkoutList from "../components/workoutList";
import Loader from "../components/Loader";
import { useOnlineStatus } from "../hooks/usePwa";
import {
  useExercises,
  useAddExercise,
  useCompleteExercise,
  useDeleteExercise,
  useAddSampleExercises,
} from "../hooks/useExercises";

const FILTERS = ["All", "Planned", "In Progress", "Completed"];

function Workouts() {
  // Filter and order live in the URL: /workouts?filter=Planned&order=desc
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "All";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";

  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState("");
  // resetKeys only affect UI (reset a card's local state), so they stay on the client
  const [resetKeys, setResetKeys] = useState({});

  const { data: exercises = [], isPending, isError, error, isFetching, refetch } =
    useExercises({ status: filter, order });
  const addExercise = useAddExercise();
  const completeExercise = useCompleteExercise();
  const deleteExercise = useDeleteExercise();
  const addSamples = useAddSampleExercises();
  // Private data comes from Firestore and is never cached by the service worker,
  // so changes are disabled while offline.
  const online = useOnlineStatus();

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

    if (isError && exercises.length === 0) {
      return (
        <div className="state-box error-box">
          <p>
            {online
              ? `Could not load exercises: ${error.message}`
              : "You're offline. Your workouts are private and need an internet connection."}
          </p>
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
              <button
                onClick={() => addSamples.mutate()}
                disabled={addSamples.isPending || !online}
              >
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
      <>
        {isError && (
          <p className="cached-badge">Showing the last loaded list. {online ? "Refresh failed." : "You're offline."}</p>
        )}
      <WorkoutList
        exercises={exercises}
        resetKeys={resetKeys}
        onRemove={(id) => deleteExercise.mutate(id)}
        onStatusChange={(id) => completeExercise.mutate(id)}
        onResetComponent={resetComponentState}
        disabled={!online}
      />
      </>
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
        <button type="submit" disabled={addExercise.isPending || !online}>
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
