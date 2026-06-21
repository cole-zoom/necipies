import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntroScroll } from "@/components/intro/IntroScroll";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { useRecipes } from "@/hooks/useRecipes";

const showIntro =
  typeof window === "undefined"
    ? true
    : !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Home() {
  const navigate = useNavigate();
  const { recipes, loading } = useRecipes({ limit: 6 });
  // Hero pool: curated seed recipes (author_id IS NULL) with images only,
  // so we never roll a missing image and every shot is a quality one.
  const { recipes: heroPool } = useRecipes({
    limit: 60,
    sort: "random",
    seedOnly: true,
    requireImage: true,
  });

  // Lock the random pick the first time data arrives. StrictMode's
  // double-effects (and any later heroPool ref changes) would otherwise
  // re-roll Math.random() and flicker the image to a different recipe.
  const [heroImage, setHeroImage] = useState<string | null>(null);
  useEffect(() => {
    if (heroPool.length === 0) return;
    setHeroImage(
      (prev) => prev ?? heroPool[Math.floor(Math.random() * heroPool.length)].image_url,
    );
  }, [heroPool]);

  return (
    <>
      {showIntro && <IntroScroll />}
      {/* Hero — full-bleed so the random recipe image replaces the page bg
          for the duration of this section, then fades back to background. */}
      <section className="relative isolate overflow-hidden">
        {heroImage && (
          <>
            {/* bg-fixed pins the image to the viewport, so as the user
                scrolls the headline + next section glide over it. Subtle
                blur keeps it as ambient texture without softening too far. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-20 bg-cover bg-top bg-fixed blur-[0.5px]"
              style={{
                // Quote the URL — many recipe CDNs (e.g. allrecipes' /thmb/)
                // include literal parens in the path, which makes an unquoted
                // url() value invalid CSS and silently drops the property.
                backgroundImage: `url("${heroImage}")`,
              }}
            />
            {/* Warm scrim: light at the top so the image clearly reads,
                fully opaque at the bottom so the section transition is seamless. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-b from-background/55 via-background/65 to-background"
            />
          </>
        )}
        <div className="container pt-12 sm:pt-20 pb-10 sm:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="size-3.5 text-ember-500" />
              <span>Snap a photo. Get a recipe. Share it with anyone.</span>
            </div>
            <h1 className="font-semibold text-[44px] sm:text-[64px] leading-[1.02] tracking-tight text-foreground">
              A calm notebook
              <br />
              for the food <em className="not-italic text-ember-600">you cook</em>.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
              A notebook for recipes. Save your own, browse a curated pantry of public ones,
              and share any of them with a single tap.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="xl" onClick={() => navigate("/new")}>
                <Camera /> Add a recipe
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate("/discover")}>
                <Search /> Browse recipes
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Recent recipes preview */}
        <section className="pb-16 pt-4">
          <div className="flex items-end justify-between mb-6 gap-3">
            <div>
              <h2 className="font-semibold text-2xl sm:text-3xl tracking-tight">Fresh from the pantry</h2>
              <p className="text-sm text-muted-foreground">Newly added by the community.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/discover">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          <RecipeGrid recipes={recipes} loading={loading} />
        </section>
      </div>
    </>
  );
}
