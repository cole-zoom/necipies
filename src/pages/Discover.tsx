import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { SearchBar } from "@/components/recipes/SearchBar";
import { useRecipes, type RecipeSort } from "@/hooks/useRecipes";
import { MEAL_TYPES, MEAL_TYPE_LABEL, type MealType } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const SORT_LABEL: Record<RecipeSort, string> = {
  random: "Random",
  newest: "Newest",
  az: "A → Z",
};

export function Discover() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [search, setSearch] = useState(initial);
  const [sort, setSort] = useState<RecipeSort>(
    (params.get("sort") as RecipeSort) || "random",
  );
  const mealParam = params.get("meal");
  const meal: MealType | null = MEAL_TYPES.includes(mealParam as MealType)
    ? (mealParam as MealType)
    : null;

  const setMeal = (next: MealType | null) => {
    if (next) {
      params.set("meal", next);
      trackEvent("filter_meal_type", { value: next });
    } else {
      params.delete("meal");
    }
    setParams(params, { replace: true });
  };

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

  useEffect(() => {
    if (sort === "random") params.delete("sort");
    else params.set("sort", sort);
    setParams(params, { replace: true });
  }, [sort]);

  const { recipes, loading, refetch } = useRecipes({
    search: debounced,
    limit: 60,
    sort,
    mealType: meal ?? undefined,
  });
  const autoFocus = useMemo(() => params.get("focus") === "1", []);

  return (
    <div className="container py-8 sm:py-12">
      <div className="max-w-2xl mb-8 animate-fade-in">
        <h1 className="font-semibold text-3xl sm:text-4xl tracking-tight">Discover recipes</h1>
        <p className="text-muted-foreground mt-1">
          Every recipe on Necipies — search by name, ingredient, or cuisine.
        </p>
        <div className="mt-5">
          <SearchBar value={search} onChange={setSearch} autoFocus={autoFocus} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by meal">
          <button
            type="button"
            onClick={() => setMeal(null)}
            aria-pressed={meal === null}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              meal === null
                ? "border-ember-300 bg-ember-100 text-ember-700 font-medium"
                : "border-border bg-card/60 hover:bg-accent text-foreground/80",
            )}
          >
            All meals
          </button>
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMeal(meal === m ? null : m)}
              aria-pressed={meal === m}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                meal === m
                  ? "border-ember-300 bg-ember-100 text-ember-700 font-medium"
                  : "border-border bg-card/60 hover:bg-accent text-foreground/80",
              )}
            >
              {MEAL_TYPE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"}`}
        </p>
        <div className="flex items-center gap-2">
          {sort === "random" && (
            <Button
              variant="outline"
              size="default"
              onClick={() => refetch()}
              aria-label="Re-roll random order"
            >
              <Shuffle /> Shuffle
            </Button>
          )}
          <Select value={sort} onValueChange={(v: RecipeSort) => setSort(v)}>
            <SelectTrigger className="h-10 w-[140px]">
              <SelectValue>{SORT_LABEL[sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="az">A → Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <RecipeGrid
        recipes={recipes}
        loading={loading}
        empty={
          <div className="space-y-2">
            <p className="font-semibold text-xl tracking-tight">No matches</p>
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
