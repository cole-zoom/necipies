import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Search, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { useRecipes } from "@/hooks/useRecipes";

export function Home() {
  const navigate = useNavigate();
  const { recipes, loading } = useRecipes({ limit: 6 });

  return (
    <div className="container">
      {/* Hero */}
      <section className="pt-12 sm:pt-20 pb-10 sm:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="size-3.5 text-ember-500" />
            <span>Snap a photo. Get a recipe. Share it with anyone.</span>
          </div>
          <h1 className="font-serif text-[44px] sm:text-[64px] leading-[1.02] tracking-tight text-foreground">
            A calm notebook
            <br />
            for the food <em className="not-italic text-ember-600">you cook</em>.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
            Necepies is Notion for recipes. Save your own, browse a curated pantry of public ones,
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
      </section>

      {/* Feature row */}
      <section className="grid gap-3 sm:grid-cols-3 mb-16">
        {[
          {
            icon: Camera,
            title: "Snap and parse",
            body: "Take a photo of any recipe and Gemini turns it into editable ingredients, steps and timing.",
          },
          {
            icon: Search,
            title: "Find what you've got",
            body: "Search by ingredient, cuisine, or name — the only thing in your way is what's in your fridge.",
          },
          {
            icon: Share2,
            title: "Share in a tap",
            body: "Every recipe gets a public link. Send it to a friend, paste it in a chat, post it anywhere.",
          },
        ].map((f) => (
          <div key={f.title} className="surface p-5">
            <div className="size-9 grid place-items-center rounded-xl bg-ember-100 text-ember-700 mb-3">
              <f.icon className="size-4" />
            </div>
            <h3 className="font-serif text-xl text-foreground tracking-tight">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Recent recipes preview */}
      <section className="pb-16">
        <div className="flex items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight">Fresh from the pantry</h2>
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
  );
}
