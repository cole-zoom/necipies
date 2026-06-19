import { Link } from "react-router-dom";
import { ChefHat, Sparkles } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { Card } from "@/components/ui/card";
import { DifficultyBadge, HealthBadge, TimeBadge } from "./MetaBadges";
import { truncate } from "@/lib/utils";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const total =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0) || null;

  return (
    <Link
      to={`/r/${recipe.slug}`}
      className="group block ring-focus rounded-2xl"
    >
      <Card className="overflow-hidden h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_30px_-12px_rgba(20,14,9,0.15)] group-hover:border-border">
        <div className="aspect-[4/3] bg-cream-100 overflow-hidden relative">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cream-100 via-cream-50 to-ember-50 grid place-items-center">
              <div
                className="grid place-items-center size-14 rounded-2xl bg-background/70 backdrop-blur-sm border border-border/70 text-ember-500 transition-transform duration-500 group-hover:scale-105"
              >
                <ChefHat className="size-6" strokeWidth={1.5} />
              </div>
            </div>
          )}
          {recipe.cuisine && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-[11px] uppercase tracking-wider text-foreground/80 border border-border/70">
                {recipe.cuisine}
              </span>
            </div>
          )}
          {recipe.is_seed && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-ember-100/95 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-wider text-ember-700 border border-ember-200">
                <Sparkles className="size-2.5" />
                Featured
              </span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-[18px] leading-tight tracking-tight text-foreground line-clamp-2 group-hover:text-ember-700 transition-colors">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {truncate(recipe.description, 110)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <TimeBadge minutes={total} />
            <DifficultyBadge value={recipe.difficulty} />
            <HealthBadge value={recipe.health_level} />
          </div>
          {(recipe.is_seed || recipe.author_name) && (
            <p className="text-[11px] text-muted-foreground/80 pt-1 border-t border-border/60">
              by{" "}
              <span className="text-foreground/80">
                {recipe.is_seed ? "the Necipies team" : recipe.author_name}
              </span>
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
