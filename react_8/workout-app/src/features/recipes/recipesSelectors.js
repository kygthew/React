import { createSelector } from "@reduxjs/toolkit";
import { recipesAdapter } from "./recipesSlice";
import { recipesPageKey } from "./recipesThunks";
import { RECIPES_PER_PAGE } from "../../services/recipesApi";

export const {
  selectEntities: selectRecipeEntities,
  selectById: selectRecipeById,
} = recipesAdapter.getSelectors((state) => state.recipes);

// State of one list page (status, error, ids, total...)
export const selectRecipesPageState = (state, page, search) =>
  state.recipes.pages[recipesPageKey(page, search)];

export const selectRecipeDetailsState = (state, id) => state.recipes.details[id];

export const selectRecipesPage = createSelector(
  [selectRecipeEntities, selectRecipesPageState],
  (entities, pageState) => {
    if (!pageState?.hasData) return null;
    return {
      recipes: pageState.ids.map((id) => entities[id]).filter(Boolean),
      total: pageState.total,
      totalPages: Math.max(1, Math.ceil(pageState.total / RECIPES_PER_PAGE)),
      fromCache: pageState.fromCache,
      cachedAt: pageState.cachedAt,
    };
  }
);

export const selectRecipeWithMeta = createSelector(
  [(state, id) => selectRecipeById(state, id), selectRecipeDetailsState],
  (recipe, details) => {
    if (!recipe) return recipe;
    return {
      ...recipe,
      fromCache: details?.fromCache ?? false,
      cachedAt: details?.cachedAt ?? null,
    };
  }
);
