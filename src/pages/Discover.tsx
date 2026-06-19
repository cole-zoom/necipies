import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { SearchBar } from "@/components/recipes/SearchBar";
import { useRecipes } from "@/hooks/useRecipes";
import { trackEvent } from "@/lib/analytics";

const POPULAR = ["Pasta", "Chicken", "Vegetarian", "Dessert", "Soup", "Salad"];

export function Discover() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [search, setSearch] = useState(initial);

  // Debounce search → query
  const [debounced, setDebounced] = useState(initial);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      if (search) {
        params.set("q", search);
        trackEvent("search", { term: search });
      } else {
        params.delete("q");
      }
      setParams(params, { replace: true });
    }, 220);
    return () => clearTimeout(t);
  }, [search]);

  const { recipes, loading } = useRecipes({ search: debounced, limit: 60 });
  const autoFocus = useMemo(() => params.get("focus") === "1", []);

  return (
    <div className="container py-8 sm:py-12">
      <div className="max-w-2xl mb-8 animate-fade-in">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">Discover recipes</h1>
        <p className="text-muted-foreground mt-1">
          Search the full library by name, ingredient, or cuisine.
        </p>
        <div className="mt-5">
          <SearchBar value={search} onChange={setSearch} autoFocus={autoFocus} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSearch(p.toLowerCase())}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-card/60 hover:bg-accent text-foreground/80"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <RecipeGrid
        recipes={recipes}
        loading={loading}
        empty={
          <div className="space-y-2">
            <p className="font-serif text-xl">No matches</p>
            <p className="text-sm text-muted-foreground">
              Try a broader keyword, or{" "}
              <a href="/new" className="text-ember-700 underline underline-offset-2">
                add this recipe yourself
              </a>
              .
            </p>
          </div>
        }
      />
    </div>
  );
}
