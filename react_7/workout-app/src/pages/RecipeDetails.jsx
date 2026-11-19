import { Link, useNavigate, useParams } from "react-router-dom";
import { useRecipe } from "../hooks/useRecipes";
import { CachedBadge } from "../components/PwaStatus";
import Loader from "../components/Loader";
import { OfflineError } from "../services/recipesApi";

function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipe, isPending, isError, error, isPlaceholderData, refetch } = useRecipe(id);

  if (isPending) return <Loader text="Loading recipe..." />;

  if (isError && !recipe) {
    return (
      <section className="state-box error-box">
        <p>
          {error instanceof OfflineError
            ? "You're offline and this recipe hasn't been saved yet."
            : `Could not load recipe: ${error.message}`}
        </p>
        <button onClick={() => refetch()}>Try again</button>
        <Link to="/recipes">← Back to meal ideas</Link>
      </section>
    );
  }

  if (!recipe) {
    return (
      <section>
        <h2>Recipe not found</h2>
        <Link to="/recipes">← Back to meal ideas</Link>
      </section>
    );
  }

  return (
    <article className="details recipe-details">
      <CachedBadge fromCache={recipe.fromCache} cachedAt={recipe.cachedAt} />

      <img src={recipe.image} alt={recipe.name} width="600" height="450" />

      <div className="recipe-details-body">
        <h2>{recipe.name}</h2>
        <p className="recipe-meta">
          {recipe.cuisine} · {recipe.difficulty} · ⭐ {recipe.rating}
        </p>

        <dl className="recipe-facts">
          <div><dt>Prep</dt><dd>{recipe.prepTimeMinutes} min</dd></div>
          <div><dt>Cook</dt><dd>{recipe.cookTimeMinutes} min</dd></div>
          <div><dt>Calories</dt><dd>{recipe.caloriesPerServing} kcal</dd></div>
          {recipe.servings && <div><dt>Servings</dt><dd>{recipe.servings}</dd></div>}
        </dl>

        {isPlaceholderData ? (
          <Loader text="Loading ingredients..." />
        ) : (
          <>
            {recipe.ingredients && (
              <>
                <h3>Ingredients</h3>
                <ul>
                  {recipe.ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            {recipe.instructions && (
              <>
                <h3>Instructions</h3>
                <ol>
                  {recipe.instructions.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </>
            )}
          </>
        )}

        <div className="workout-actions">
          <button onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>
    </article>
  );
}

export default RecipeDetails;
