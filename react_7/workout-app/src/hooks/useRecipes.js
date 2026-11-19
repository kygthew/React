import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRecipes, fetchRecipe } from "../services/recipesApi";

export const recipeKeys = {
  all: ["recipes"],
  list: (page, search) => ["recipes", "list", { page, search }],
  detail: (id) => ["recipes", "detail", String(id)],
};

export function useRecipes({ page, search }) {
  return useQuery({
    queryKey: recipeKeys.list(page, search),
    queryFn: () => fetchRecipes({ page, search }),
    staleTime: 5 * 60 * 1000, // public data changes rarely
    placeholderData: (previous) => previous, // keep old page visible while next one loads
  });
}

export function useRecipe(id) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => fetchRecipe(id),
    staleTime: 5 * 60 * 1000,
    // Show the card data from the list instantly while full details load
    placeholderData: () =>
      queryClient
        .getQueriesData({ queryKey: ["recipes", "list"] })
        .flatMap(([, data]) => data?.recipes ?? [])
        .find((recipe) => String(recipe.id) === String(id)),
  });
}
