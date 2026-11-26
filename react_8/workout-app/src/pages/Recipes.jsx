import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRecipes } from "../hooks/useRecipes";
import { CachedBadge } from "../components/PwaStatus";
import Loader from "../components/Loader";
import { useDebounce } from "../hooks/useDebounce";

// Public page — no login required. Page and search live in the URL:
// /recipes?page=2&q=pasta
function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("q") || "";
  // What the user is typing — temporary UI state, so it stays local
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput.trim(), 400);

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } =
    useRecipes({ page, search });

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage === 1) next.delete("page");
    else next.set("page", String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applySearch = (value) => {
    if (value === search) return;
    const next = new URLSearchParams();
    if (value) next.set("q", value);
    setSearchParams(next, { replace: true }); // new search → back to page 1
  };

  // Debounce: the URL (and the request) changes 400 ms after the user stops typing
  useEffect(() => {
    applySearch(debouncedSearch);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enter / "Search" button: search right away without waiting
  const handleSearch = (event) => {
    event.preventDefault();
    applySearch(searchInput.trim());
  };

  const renderContent = () => {
    if (isPending) return <Loader text="Loading meal ideas..." />;

    if (isError && !data) {
      return (
        <div className="state-box error-box">
          <p>
            {error?.name === "OfflineError"
              ? "You're offline and this page of meal ideas hasn't been saved yet."
              : `Could not load meal ideas: ${error.message}`}
          </p>
          <button onClick={() => refetch()}>Try again</button>
        </div>
      );
    }

    if (data.recipes.length === 0) {
      return (
        <div className="state-box">
          <p>No meal ideas found{search ? ` for "${search}"` : ""}.</p>
        </div>
      );
    }

    return (
      <>
        <CachedBadge fromCache={data.fromCache} cachedAt={data.cachedAt} />

        <div className={`recipe-grid ${isPlaceholderData ? "is-loading" : ""}`}>
          {data.recipes.map((recipe) => (
            <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="recipe-card">
              <img src={recipe.image} alt="" loading="lazy" width="400" height="300" />
              <div className="recipe-card-body">
                <h3>{recipe.name}</h3>
                <p className="recipe-meta">
                  {recipe.cuisine} · {recipe.difficulty} ·{" "}
                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
                </p>
                <p className="recipe-meta">
                  🔥 {recipe.caloriesPerServing} kcal · ⭐ {recipe.rating}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <nav className="pagination" aria-label="Pages">
          <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>
            ← Prev
          </button>
          <span>
            Page {page} of {data.totalPages}
          </span>
          <button onClick={() => goToPage(page + 1)} disabled={page >= data.totalPages}>
            Next →
          </button>
        </nav>
      </>
    );
  };

  return (
    <section>
      <h2>
        Meal ideas{" "}
        {isFetching && !isPending && <small className="muted">updating…</small>}
      </h2>
      <p className="subtitle">Fuel your training. Public recipes, available offline after viewing.</p>

      <form className="add-form" onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder="Search recipes (e.g. pasta)"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label="Search recipes"
        />
        <button type="submit">Search</button>
      </form>

      {renderContent()}
    </section>
  );
}

export default Recipes;
