import { RecipeForm } from "@/components/recipes/RecipeForm";

export function NewRecipe() {
  return (
    <div className="container py-8 sm:py-12 max-w-3xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">Add a recipe</h1>
        <p className="text-muted-foreground mt-1">
          Snap a photo and we&rsquo;ll fill the form, or just type it in yourself.
        </p>
      </div>
      <RecipeForm />
    </div>
  );
}
