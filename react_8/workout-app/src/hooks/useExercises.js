import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useRefreshOnFocus } from "./useRefreshOnFocus";
import {
  fetchExercises,
  fetchExerciseById,
  addExercise,
  completeExercise,
  deleteExercise,
  addSampleExercises,
} from "../features/exercises/exercisesThunks";
import {
  selectVisibleExercises,
  selectExercisesListState,
  selectExerciseStats,
  selectExerciseById,
  selectExerciseDetailsState,
  selectMutationState,
} from "../features/exercises/exercisesSelectors";

function useLoadExercises() {
  const { user } = useAuth();
  const uid = user?.uid;
  const dispatch = useDispatch();
  const listState = useSelector(selectExercisesListState);
  const loadedFor = useSelector((state) => state.exercises.uid);

  useEffect(() => {
    if (uid) dispatch(fetchExercises({ uid }));
  }, [uid, dispatch]);

  useRefreshOnFocus(({ reconnect }) => {
    if (uid) dispatch(fetchExercises({ uid, force: reconnect }));
  });

  const refetch = useCallback(
    () => dispatch(fetchExercises({ uid, force: true })),
    [uid, dispatch]
  );

  const hasData = loadedFor === uid && listState.lastFetched !== null;
  return {
    isPending: !hasData && listState.status !== "failed",
    isFetching: listState.status === "loading",
    isError: listState.status === "failed",
    error: listState.error ? { message: listState.error } : null,
    refetch,
  };
}

export function useExercises({ status = "All", order = "asc" } = {}) {
  const query = useLoadExercises();
  const data = useSelector((state) => selectVisibleExercises(state, status, order));
  return { ...query, data };
}

export function useExerciseStats() {
  const query = useLoadExercises();
  const stats = useSelector(selectExerciseStats);
  return { ...query, stats };
}

export function useExercise(id) {
  const { user } = useAuth();
  const uid = user?.uid;
  const dispatch = useDispatch();
  const exercise = useSelector((state) => selectExerciseById(state, id));
  const details = useSelector((state) => selectExerciseDetailsState(state, id));

  useEffect(() => {
    if (uid && id) dispatch(fetchExerciseById({ uid, id }));
  }, [uid, id, dispatch]);

  const refetch = useCallback(
    () => dispatch(fetchExerciseById({ uid, id, force: true })),
    [uid, id, dispatch]
  );

  const done = details?.status === "succeeded" || details?.status === "failed";
  return {
    data: exercise ?? (details?.notFound ? null : undefined),
    isPending: !exercise && !done,
    isError: details?.status === "failed",
    error: details?.error ? { message: details.error } : null,
    refetch,
  };
}

function useExerciseMutation(key, makeAction) {
  const { user } = useAuth();
  const uid = user?.uid;
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => selectMutationState(state, key));

  const mutate = useCallback(
    (variables, { onSuccess, onError } = {}) => {
      dispatch(makeAction(uid, variables))
        .unwrap()
        .then(onSuccess, (err) => onError?.(err));
    },
    [uid, dispatch, makeAction]
  );

  return {
    mutate,
    isPending: status === "loading",
    error: error ? { message: error } : null,
  };
}

const makeAdd = (uid, exercise) => addExercise({ uid, exercise });
const makeComplete = (uid, id) => completeExercise({ uid, id });
const makeDelete = (uid, id) => deleteExercise({ uid, id });
const makeSamples = (uid) => addSampleExercises({ uid });

export const useAddExercise = () => useExerciseMutation("add", makeAdd);
export const useCompleteExercise = () => useExerciseMutation("complete", makeComplete);
export const useDeleteExercise = () => useExerciseMutation("remove", makeDelete);
export const useAddSampleExercises = () => useExerciseMutation("samples", makeSamples);
