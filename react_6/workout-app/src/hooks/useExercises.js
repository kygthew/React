
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/exercisesApi";

export const exerciseKeys = {
  all: (uid) => ["exercises", uid],
  lists: (uid) => ["exercises", uid, "list"],
  list: (uid, filters) => ["exercises", uid, "list", filters],
  detail: (uid, id) => ["exercises", uid, "detail", id],
};

export function useExercises({ status = "All", order = "asc" } = {}) {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: exerciseKeys.list(uid, { status, order }),
    queryFn: () => api.fetchExercises(uid, { status, order }),
    enabled: Boolean(uid), // don't fetch until we know who the user is
    placeholderData: (previous) => previous, // keep old list visible while a new filter loads
  });
}

export function useExercise(id) {
  const { user } = useAuth();
  const uid = user?.uid;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: exerciseKeys.detail(uid, id),
    queryFn: () => api.fetchExercise(uid, id),
    enabled: Boolean(uid && id),
    placeholderData: () =>
      queryClient
        .getQueriesData({ queryKey: exerciseKeys.lists(uid) })
        .flatMap(([, list]) => list ?? [])
        .find((exercise) => exercise.id === id),
  });
}

function useExerciseMutation(mutationFn, updateListOptimistically) {
  const { user } = useAuth();
  const uid = user?.uid;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => mutationFn(uid, variables),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: exerciseKeys.all(uid) });

      if (updateListOptimistically) {
        queryClient.setQueriesData({ queryKey: exerciseKeys.lists(uid) }, (list) =>
          list ? updateListOptimistically(list, variables) : list
        );
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: exerciseKeys.all(uid) }),
  });
}

export const useAddExercise = () =>
  useExerciseMutation((uid, exercise) => api.createExercise(uid, exercise));

export const useCompleteExercise = () =>
  useExerciseMutation(
    (uid, id) => api.updateExercise(uid, id, { status: "Completed" }),
    (list, id) => list.map((e) => (e.id === id ? { ...e, status: "Completed" } : e))
  );

export const useDeleteExercise = () =>
  useExerciseMutation(
    (uid, id) => api.deleteExercise(uid, id),
    (list, id) => list.filter((e) => e.id !== id)
  );

export const useAddSampleExercises = () =>
  useExerciseMutation((uid) => api.addSampleExercises(uid));
