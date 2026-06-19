import { Navigate, useLocation } from "react-router-dom";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useAuth } from "@/hooks/useAuth";

export function NewRecipe() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    // Recipes need an author for accountability and so they land in the
    // creator's cookbook. Send guests to sign-in, preserving the intent.
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname, reason: "new-recipe" }}
      />
    );
  }

  return (
    <div className="container py-8 sm:py-12 max-w-3xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-semibold text-3xl sm:text-4xl tracking-tight">Add a recipe</h1>
        <p className="text-muted-foreground mt-1">
          Snap a photo and we&rsquo;ll fill the form, or just type it in yourself.
        </p>
      </div>
      <RecipeForm />
    </div>
  );
}
