import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRefreshOnFocus } from "./useRefreshOnFocus";
import { fetchRecipes, fetchRecipeById, recipesPageKey } from "../features/recipes/recipesThunks";
import {
  selectRecipesPage,
  selectRecipesPageState,
  selectRecipeWithMeta,
  selectRecipeDetailsState,
} from "../features/recipes/recipesSelectors";

export function useRecipes({ page, search }) {
  const dispatch = useDispatch();
  const key = recipesPageKey(page, search);
  const pageState = useSelector((state) => selectRecipesPageState(state, page, search));
  const data = useSelector((state) => selectRecipesPage(state, page, search));

  const inFlight = useRef(null);
  useEffect(() => {
    if (inFlight.current && inFlight.current.key !== key) inFlight.current.promise.abort();
    inFlight.current = { key, promise: dispatch(fetchRecipes({ page, search })) };
  }, [key, page, search, dispatch]);

  useRefreshOnFocus(({ reconnect }) => dispatch(fetchRecipes({ page, search, force: reconnect })));

  const lastData = useRef(null);
  if (data) lastData.current = data;
  const shown = data ?? lastData.current;

  const refetch = useCallback(
    () => dispatch(fetchRecipes({ page, search, force: true })),
    [page, search, dispatch]
  );

  const status = pageState?.status ?? "idle";
  return {
    data: shown,
    isPlaceholderData: !data && Boolean(shown),
    isPending: !shown && status !== "failed",
    isFetching: status === "loading",
    isError: status === "failed",
    error: pageState?.error ?? null,
    refetch,
  };
}

export function useRecipe(id) {
  const dispatch = useDispatch();
  const recipe = useSelector((state) => selectRecipeWithMeta(state, id));
  const details = useSelector((state) => selectRecipeDetailsState(state, id));

  useEffect(() => {
    dispatch(fetchRecipeById({ id }));
  }, [id, dispatch]);

  const refetch = useCallback(() => dispatch(fetchRecipeById({ id, force: true })), [id, dispatch]);

  const status = details?.status ?? "idle";
  const loadedFully = status === "succeeded" && !details.notFound;
  return {
    data: details?.notFound ? null : recipe,
    isPlaceholderData: Boolean(recipe) && !loadedFully,
    isPending: !recipe && status !== "failed" && !details?.notFound,
    isError: status === "failed",
    error: details?.error ?? null,
    refetch,
  };
}
