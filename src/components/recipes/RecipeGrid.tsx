import type { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  recipes: Recipe[];
  loading?: boolean;
  empty?: React.ReactNode;
}

export function RecipeGrid({ recipes, loading, empty }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  if (!recipes.length) {
    return (
      <div className="surface p-10 text-center animate-fade-in">
        {empty ?? (
          <p className="text-muted-foreground">
            No recipes yet. Be the first to add one.
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-fade-in">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
