import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../services/recipesApi";

export const RECIPES_STALE_MS = 5 * 60 * 1000;

// Every page + search combination is stored under its own key,
// so an answer for an old page/search can never replace the current one.
export const recipesPageKey = (page, search = "") =>
  `${search.trim().toLowerCase()}|${page}`;
const isFresh = (entry) =>
  entry?.status === "succeeded" &&
  !entry.fromCache &&
  Date.now() - entry.fetchedAt < RECIPES_STALE_MS;

export const fetchRecipes = createAsyncThunk(
  "recipes/fetchPage",
  async ({ page, search }, { signal }) => api.fetchRecipes({ page, search, signal }),
  {
    condition: ({ page, search, force = false }, { getState }) => {
      const entry = getState().recipes.pages[recipesPageKey(page, search)];
      if (force) return true;
      if (entry?.status === "loading") return false; // already running
      if (isFresh(entry)) return false; // cached in the store → no request
      return true;
    },
  }
);

export const fetchRecipeById = createAsyncThunk(
  "recipes/fetchById",
  async ({ id }, { signal }) => api.fetchRecipe(id, signal),
  {
    condition: ({ id, force = false }, { getState }) => {
      const entry = getState().recipes.details[id];
      if (force) return true;
      if (entry?.status === "loading") return false;
      if (isFresh(entry)) return false;
      return true;
    },
  }
);
