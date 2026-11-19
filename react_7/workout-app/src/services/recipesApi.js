// Public API (no login needed): https://dummyjson.com/docs/recipes


const BASE_URL = "https://dummyjson.com";
export const RECIPES_PER_PAGE = 12;

const LIST_FIELDS = [
  "name",
  "image",
  "cuisine",
  "difficulty",
  "prepTimeMinutes",
  "cookTimeMinutes",
  "caloriesPerServing",
  "rating",
  "mealType",
].join(",");

export class OfflineError extends Error {
  constructor() {
    super("You are offline and this data has not been saved yet.");
    this.name = "OfflineError";
  }
}

async function request(path) {
  let response;
  try {
    response = await fetch(BASE_URL + path);
  } catch {
    // No service worker yet (first visit) and no network
    throw new OfflineError();
  }

  if (response.status === 503 && response.headers.get("X-SW-Offline")) {
    throw new OfflineError();
  }
  if (response.status === 404) return { data: null, fromCache: false, cachedAt: null };
  if (!response.ok) throw new Error(`Request failed (${response.status})`);

  return {
    data: await response.json(),
    fromCache: response.headers.get("X-SW-Cache") === "HIT",
    cachedAt: Number(response.headers.get("X-SW-Cached-At")) || null,
  };
}

export async function fetchRecipes({ page = 1, search = "" }) {
  const skip = (page - 1) * RECIPES_PER_PAGE;
  const params = `limit=${RECIPES_PER_PAGE}&skip=${skip}&select=${LIST_FIELDS}`;
  const path = search
    ? `/recipes/search?q=${encodeURIComponent(search)}&${params}`
    : `/recipes?${params}`;

  const { data, fromCache, cachedAt } = await request(path);
  return {
    recipes: data?.recipes ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / RECIPES_PER_PAGE)),
    fromCache,
    cachedAt,
  };
}

export async function fetchRecipe(id) {
  const { data, fromCache, cachedAt } = await request(`/recipes/${encodeURIComponent(id)}`);
  return data ? { ...data, fromCache, cachedAt } : null;
}
