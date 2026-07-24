import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useAuth } from "@/hooks/useAuth";
import { getRecipeBySlug } from "@/hooks/useRecipes";
import type { Recipe } from "@/types/recipe";
import { toast } from "sonner";

export function EditRecipe() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    getRecipeBySlug(slug)
      .then((r) => {
        if (!mounted) return;
        setRecipe(r);
        setStatus(r ? "ok" : "notfound");
      })
      .catch(() => mounted && setStatus("notfound"));
    return () => {
      mounted = false;
    };
  }, [slug]);

  const denied =
    status === "ok" && !!recipe && !!user && recipe.author_id !== user.id;

  useEffect(() => {
    if (denied) toast.error("You can only edit your own recipes.");
  }, [denied]);

  if (authLoading || status === "loading") return null;

  // Not signed in → sign-in, preserving intent to come back here.
  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname, reason: "edit-recipe" }}
      />
    );
  }

  if (status === "notfound" || !recipe) {
    return <Navigate to="/discover" replace />;
  }

  // Not the owner (incl. seed recipes with a null author) → back to the recipe.
  // RLS would reject the write anyway; this is the UX layer.
  if (recipe.author_id !== user.id) {
    return <Navigate to={`/r/${recipe.slug}`} replace />;
  }

  return (
    <div className="container py-8 sm:py-12 max-w-3xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-semibold text-3xl sm:text-4xl tracking-tight">Edit recipe</h1>
        <p className="text-muted-foreground mt-1">
          Update the details and save your changes. The link stays the same.
        </p>
      </div>
      <RecipeForm initial={recipe} />
    </div>
  );
}
