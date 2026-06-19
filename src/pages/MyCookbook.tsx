import { Link } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { useRecipes } from "@/hooks/useRecipes";
import { useAuth } from "@/hooks/useAuth";

export function MyCookbook() {
  const { user, loading: authLoading } = useAuth();
  const { recipes, loading } = useRecipes({
    authorId: user?.id ?? null,
    limit: 100,
    // Seed/curated rows can leak in if they were inserted with a real author_id
    // (e.g. by a logged-in seed script). My Cookbook is for things YOU added.
    excludeSeed: true,
  });

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="container py-16 max-w-md text-center">
        <div className="mx-auto size-12 grid place-items-center rounded-2xl bg-ember-100 text-ember-700 mb-5">
          <BookOpen />
        </div>
        <h1 className="font-semibold text-3xl tracking-tight">Your private shelf</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to save recipes to your own cookbook. Anything you add still gets a shareable public link.
        </p>
        <Button asChild className="mt-6">
          <Link to="/signin">Sign in to continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-12">
      <div className="flex items-end justify-between gap-3 mb-6 animate-fade-in">
        <div>
          <h1 className="font-semibold text-3xl sm:text-4xl tracking-tight">My cookbook</h1>
          <p className="text-muted-foreground mt-1">
            Recipes you&rsquo;ve added · {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>
        <Button asChild>
          <Link to="/new"><Plus /> New recipe</Link>
        </Button>
      </div>
      <RecipeGrid
        recipes={recipes}
        loading={loading}
        empty={
          <div className="space-y-2">
            <p className="font-semibold text-xl tracking-tight">Nothing here yet</p>
            <p className="text-sm text-muted-foreground">Add your first recipe to start building your cookbook.</p>
            <div className="pt-4">
              <Button asChild><Link to="/new"><Plus /> Add a recipe</Link></Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
