import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../services/exercisesApi";

export const EXERCISES_STALE_MS = 60 * 1000;

const isFresh = (lastFetched) =>
  Boolean(lastFetched) && Date.now() - lastFetched < EXERCISES_STALE_MS;
export const fetchExercises = createAsyncThunk(
  "exercises/fetchAll",
  async ({ uid }) => api.fetchExercises(uid),
  {
    condition: ({ uid, force = false }, { getState }) => {
      if (!uid) return false;
      const { list, uid: loadedFor } = getState().exercises;
      if (force) return true;
      if (loadedFor !== uid) return true; // other user → always load
      if (list.status === "loading") return false; // same request already running
      if (isFresh(list.lastFetched)) return false; // data is still fresh
      return true;
    },
  }
);

export const fetchExerciseById = createAsyncThunk(
  "exercises/fetchById",
  async ({ uid, id }) => api.fetchExercise(uid, id), // null = not found
  {
    condition: ({ uid, id, force = false }, { getState }) => {
      if (!uid || !id) return false;
      if (force) return true;
      const state = getState().exercises;
      // Already in the store from a fresh list → no request needed
      if (state.entities[id] && isFresh(state.list.lastFetched)) return false;
      if (state.details[id]?.status === "loading") return false;
      return true;
    },
  }
);

function withRefresh(run) {
  return async (args, { dispatch }) => {
    try {
      return await run(args);
    } finally {
      dispatch(fetchExercises({ uid: args.uid, force: true }));
    }
  };
}

export const addExercise = createAsyncThunk(
  "exercises/add",
  withRefresh(({ uid, exercise }) => api.createExercise(uid, exercise))
);

export const completeExercise = createAsyncThunk(
  "exercises/complete",
  withRefresh(async ({ uid, id }) => {
    await api.updateExercise(uid, id, { status: "Completed" });
    return id;
  })
);

export const deleteExercise = createAsyncThunk(
  "exercises/delete",
  withRefresh(async ({ uid, id }) => {
    await api.deleteExercise(uid, id);
    return id;
  })
);

export const addSampleExercises = createAsyncThunk(
  "exercises/addSamples",
  withRefresh(({ uid }) => api.addSampleExercises(uid))
);
