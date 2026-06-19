import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShareButton } from "@/components/recipes/ShareButton";
import {
  DifficultyBadge,
  HealthBadge,
  ServingsBadge,
  TimeBadge,
} from "@/components/recipes/MetaBadges";
import { getRecipeBySlug } from "@/hooks/useRecipes";
import type { Recipe } from "@/types/recipe";
import { trackEvent } from "@/lib/analytics";

export function RecipeDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecipeBySlug(slug)
      .then((r) => {
        if (!r) setMissing(true);
        setRecipe(r);
        if (r) trackEvent("recipe_viewed", { slug: r.slug });
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-10 max-w-3xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="aspect-[16/9] w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (missing || !recipe) {
    return (
      <div className="container py-20 max-w-md text-center">
        <h1 className="font-semibold tracking-tight text-3xl">Recipe not found</h1>
        <p className="mt-2 text-muted-foreground">
          The link may be wrong or this recipe has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/discover">Back to discover</Link>
        </Button>
      </div>
    );
  }

  const total =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0) || null;

  return (
    <article className="container py-6 sm:py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/discover">
            <ArrowLeft /> All recipes
          </Link>
        </Button>
        <ShareButton title={recipe.title} slug={recipe.slug} />
      </div>

      <header className="space-y-4 animate-fade-in">
        {recipe.cuisine && (
          <p className="text-xs uppercase tracking-[0.18em] text-ember-700">{recipe.cuisine}</p>
        )}
        <h1 className="font-semibold text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          {recipe.title}
        </h1>
        {recipe.description && (
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {recipe.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <TimeBadge minutes={total} />
          <DifficultyBadge value={recipe.difficulty} />
          <HealthBadge value={recipe.health_level} />
          <ServingsBadge value={recipe.servings} />
        </div>
        {recipe.author_name && (
          <p className="text-sm text-muted-foreground">
            by <span className="text-foreground/90">{recipe.author_name}</span>
          </p>
        )}
      </header>

      {recipe.image_url && (
        <div className="mt-8 rounded-2xl overflow-hidden border border-border bg-cream-100">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full max-h-[480px] object-cover"
            loading="lazy"
          />
        </div>
      )}

      <Separator className="my-10" />

      <div className="grid gap-10 md:grid-cols-[260px_1fr]">
        <aside>
          <h2 className="font-semibold text-2xl tracking-tight mb-4">Ingredients</h2>
          <ul className="space-y-2.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-[15px]">
                <span className="mt-2 size-1.5 rounded-full bg-ember-500 shrink-0" />
                <span className="leading-snug">{ing}</span>
              </li>
            ))}
          </ul>
          {recipe.yield_label && (
            <p className="mt-5 text-xs text-muted-foreground">
              Yields {recipe.yield_label}
            </p>
          )}
        </aside>

        <section>
          <h2 className="font-semibold text-2xl tracking-tight mb-4">Steps</h2>
          <ol className="space-y-5">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="mt-0.5 grid place-items-center size-8 shrink-0 rounded-full bg-ember-100 text-ember-700 text-sm font-semibold tabular-nums">
                  {i + 1}
                </span>
                <p className="text-[15.5px] leading-7 text-foreground/90">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <Separator className="my-12" />

      <footer className="flex flex-wrap items-center justify-between gap-3">
        {recipe.source_url ? (
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <ExternalLink className="size-4" /> View original source
          </a>
        ) : (
          <span />
        )}
        <Button asChild variant="outline">
          <Link to="/new">
            <BookOpen /> Add your own
          </Link>
        </Button>
      </footer>
    </article>
  );
}
