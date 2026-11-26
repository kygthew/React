import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { userLoggedOut } from "../../store/actions";
import {
  fetchExercises,
  fetchExerciseById,
  addExercise,
  completeExercise,
  deleteExercise,
  addSampleExercises,
} from "./exercisesThunks";

export const exercisesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.createdAt - b.createdAt,
});

const idle = { status: "idle", error: null };

const initialState = exercisesAdapter.getInitialState({
  uid: null,
  list: { status: "idle", error: null, lastFetched: null, requestId: null },
  details: {}, // { [id]: { status, error, notFound } }
  mutations: {
    add: idle,
    complete: idle,
    remove: idle,
    samples: idle,
  },
});


function addMutationCases(builder, thunk, key, onPending) {
  builder
    .addCase(thunk.pending, (state, action) => {
      onPending?.(state, action);
      state.mutations[key] = { status: "loading", error: null };
      if (state.list.status === "loading") state.list.requestId = null;
    })
    .addCase(thunk.fulfilled, (state) => {
      state.mutations[key] = { status: "succeeded", error: null };
    })
    .addCase(thunk.rejected, (state, action) => {
      state.mutations[key] = { status: "failed", error: action.error.message };
    });
}

const exercisesSlice = createSlice({
  name: "exercises",
  initialState,
  reducers: {
    clearMutationError(state, action) {
      state.mutations[action.payload] = idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state, action) => {
        const { uid } = action.meta.arg;
        if (state.uid !== uid) {
          exercisesAdapter.removeAll(state);
          state.details = {};
          state.list.lastFetched = null;
          state.uid = uid;
        }
        state.list.status = "loading";
        state.list.error = null;
        // Remember the newest request; older answers will be ignored
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return; // stale answer
        exercisesAdapter.setAll(state, action.payload);
        state.list.status = "succeeded";
        state.list.lastFetched = Date.now();
        state.list.requestId = null;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return; // stale answer
        state.list.status = "failed";
        state.list.error = action.error.message;
        state.list.requestId = null;
        // Old entities stay, so the UI can still show the last loaded list
      });

    builder
      .addCase(fetchExerciseById.pending, (state, action) => {
        state.details[action.meta.arg.id] = {
          status: "loading",
          error: null,
          notFound: false,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchExerciseById.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        if (state.details[id]?.requestId !== action.meta.requestId) return;
        if (action.payload) exercisesAdapter.upsertOne(state, action.payload);
        else exercisesAdapter.removeOne(state, id);
        state.details[id] = { status: "succeeded", error: null, notFound: !action.payload };
      })
      .addCase(fetchExerciseById.rejected, (state, action) => {
        const { id } = action.meta.arg;
        if (state.details[id]?.requestId !== action.meta.requestId) return;
        state.details[id] = { status: "failed", error: action.error.message, notFound: false };
      });

    addMutationCases(builder, addExercise, "add");
    addMutationCases(builder, completeExercise, "complete", (state, action) => {
      exercisesAdapter.updateOne(state, {
        id: action.meta.arg.id,
        changes: { status: "Completed" },
      });
    });
    addMutationCases(builder, deleteExercise, "remove", (state, action) => {
      exercisesAdapter.removeOne(state, action.meta.arg.id);
    });
    addMutationCases(builder, addSampleExercises, "samples");

    builder.addCase(userLoggedOut, () => initialState);
  },
});

export const { clearMutationError } = exercisesSlice.actions;
export default exercisesSlice.reducer;
