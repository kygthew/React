import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { fetchRecipes, fetchRecipeById, recipesPageKey } from "./recipesThunks";

export const recipesAdapter = createEntityAdapter();

const initialState = recipesAdapter.getInitialState({
  // "search|page" → { ids, total, status, error, fetchedAt, fromCache, cachedAt, requestId }
  pages: {},
  // id → { status, error, notFound, fetchedAt, fromCache, cachedAt, requestId }
  details: {},
});

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state, action) => {
        const { page, search } = action.meta.arg;
        const key = recipesPageKey(page, search);
        const previous = state.pages[key];
        state.pages[key] = {
          // keep old ids while refreshing, so the page doesn't flash empty
          ids: previous?.ids ?? [],
          total: previous?.total ?? 0,
          fetchedAt: previous?.fetchedAt ?? null,
          fromCache: previous?.fromCache ?? false,
          cachedAt: previous?.cachedAt ?? null,
          hasData: Boolean(previous?.hasData),
          status: "loading",
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        const { page, search } = action.meta.arg;
        const entry = state.pages[recipesPageKey(page, search)];
        if (entry?.requestId !== action.meta.requestId) return;
        const { recipes, total, fromCache, cachedAt } = action.payload;
        // upsert = merge, so short list items don't erase loaded ingredients
        recipesAdapter.upsertMany(state, recipes);
        Object.assign(entry, {
          ids: recipes.map((recipe) => recipe.id),
          total,
          fromCache,
          cachedAt,
          hasData: true,
          status: "succeeded",
          error: null,
          fetchedAt: Date.now(),
          requestId: null,
        });
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        const { page, search } = action.meta.arg;
        const entry = state.pages[recipesPageKey(page, search)];
        if (entry?.requestId !== action.meta.requestId) return;
        entry.requestId = null;
        if (action.meta.aborted) {
          entry.status = entry.hasData ? "succeeded" : "idle";
          return;
        }
        entry.status = "failed";
        entry.error = { name: action.error.name, message: action.error.message };
      });

    builder
      .addCase(fetchRecipeById.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.details[id] = {
          ...state.details[id],
          status: "loading",
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        const entry = state.details[id];
        if (entry?.requestId !== action.meta.requestId) return;
        const recipe = action.payload;
        if (recipe) {
          const { fromCache, cachedAt, ...data } = recipe;
          recipesAdapter.upsertOne(state, data);
          Object.assign(entry, { fromCache, cachedAt, notFound: false });
        } else {
          Object.assign(entry, { fromCache: false, cachedAt: null, notFound: true });
        }
        Object.assign(entry, {
          status: "succeeded",
          fetchedAt: Date.now(),
          requestId: null,
        });
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const entry = state.details[id];
        if (entry?.requestId !== action.meta.requestId) return;
        entry.requestId = null;
        if (action.meta.aborted) {
          entry.status = entry.fetchedAt ? "succeeded" : "idle";
          return;
        }
        entry.status = "failed";
        entry.error = { name: action.error.name, message: action.error.message };
      });
  },
});

export default recipesSlice.reducer;
