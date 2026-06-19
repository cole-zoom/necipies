import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PhotoExtract } from "./PhotoExtract";
import type {
  Difficulty,
  ExtractedRecipe,
  HealthLevel,
  Recipe,
} from "@/types/recipe";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface FormState {
  title: string;
  description: string;
  cuisine: string;
  difficulty: Difficulty;
  health_level: HealthLevel;
  prep_time_minutes: string;
  cook_time_minutes: string;
  servings: string;
  yield_label: string;
  ingredients: string[];
  steps: string[];
  image_url: string;
  source_url: string;
  author_name: string;
}

const empty: FormState = {
  title: "",
  description: "",
  cuisine: "",
  difficulty: "easy",
  health_level: "balanced",
  prep_time_minutes: "",
  cook_time_minutes: "",
  servings: "",
  yield_label: "",
  ingredients: [""],
  steps: [""],
  image_url: "",
  source_url: "",
  author_name: "",
};

export function RecipeForm({ initial }: { initial?: Partial<Recipe> }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    ...empty,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    cuisine: initial?.cuisine ?? "",
    difficulty: (initial?.difficulty ?? "easy") as Difficulty,
    health_level: (initial?.health_level ?? "balanced") as HealthLevel,
    prep_time_minutes: initial?.prep_time_minutes?.toString() ?? "",
    cook_time_minutes: initial?.cook_time_minutes?.toString() ?? "",
    servings: initial?.servings?.toString() ?? "",
    yield_label: initial?.yield_label ?? "",
    ingredients: initial?.ingredients?.length ? initial.ingredients : [""],
    steps: initial?.steps?.length ? initial.steps : [""],
    image_url: initial?.image_url ?? "",
    source_url: initial?.source_url ?? "",
    author_name: initial?.author_name ?? "",
  });
  const [saving, setSaving] = useState(false);

  const updateList = (key: "ingredients" | "steps", i: number, v: string) =>
    setForm((f) => ({ ...f, [key]: f[key].map((x, idx) => (idx === i ? v : x)) }));
  const addItem = (key: "ingredients" | "steps") =>
    setForm((f) => ({ ...f, [key]: [...f[key], ""] }));
  const removeItem = (key: "ingredients" | "steps", i: number) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].filter((_, idx) => idx !== i).length
        ? f[key].filter((_, idx) => idx !== i)
        : [""],
    }));

  const fillFromExtracted = (r: ExtractedRecipe) => {
    setForm((f) => ({
      ...f,
      title: r.title || f.title,
      description: r.description ?? f.description,
      cuisine: r.cuisine ?? f.cuisine,
      difficulty: r.difficulty ?? f.difficulty,
      health_level: r.health_level ?? f.health_level,
      prep_time_minutes:
        r.prep_time_minutes?.toString() ?? f.prep_time_minutes,
      cook_time_minutes:
        r.cook_time_minutes?.toString() ?? f.cook_time_minutes,
      servings: r.servings?.toString() ?? f.servings,
      yield_label: r.yield_label ?? f.yield_label,
      ingredients: r.ingredients?.length ? r.ingredients : f.ingredients,
      steps: r.steps?.length ? r.steps : f.steps,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please give your recipe a title.");
      return;
    }
    const cleanedIngredients = form.ingredients.map((s) => s.trim()).filter(Boolean);
    const cleanedSteps = form.steps.map((s) => s.trim()).filter(Boolean);
    if (cleanedIngredients.length === 0) {
      toast.error("Add at least one ingredient.");
      return;
    }
    if (cleanedSteps.length === 0) {
      toast.error("Add at least one step.");
      return;
    }

    setSaving(true);
    const baseSlug = slugify(form.title);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    const payload = {
      slug,
      title: form.title.trim(),
      description: form.description.trim() || null,
      cuisine: form.cuisine.trim() || null,
      difficulty: form.difficulty,
      health_level: form.health_level,
      prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
      cook_time_minutes: form.cook_time_minutes ? Number(form.cook_time_minutes) : null,
      servings: form.servings ? Number(form.servings) : null,
      yield_label: form.yield_label.trim() || null,
      ingredients: cleanedIngredients,
      ingredients_text: cleanedIngredients.join(" • "),
      steps: cleanedSteps,
      image_url: form.image_url.trim() || null,
      source_url: form.source_url.trim() || null,
      author_name: form.author_name.trim() || user?.email?.split("@")[0] || "anonymous chef",
      author_id: user?.id ?? null,
      is_seed: false,
    };

    const { data, error } = await supabase
      .from("recipes")
      .insert(payload)
      .select("slug")
      .single();

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    trackEvent("recipe_created", { slug: data?.slug });
    toast.success("Recipe saved!");
    navigate(`/r/${data?.slug ?? slug}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PhotoExtract onExtracted={fillFromExtracted} />

      <section className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Grandma's apple pie"
            className="h-12 text-lg font-serif"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Short description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What makes this recipe special?"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Cuisine</Label>
            <Input
              value={form.cuisine}
              onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
              placeholder="Italian, Thai…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Servings</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={form.servings}
              onChange={(e) => setForm({ ...form, servings: e.target.value })}
              placeholder="4"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Prep (min)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.prep_time_minutes}
              onChange={(e) => setForm({ ...form, prep_time_minutes: e.target.value })}
              placeholder="15"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cook (min)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.cook_time_minutes}
              onChange={(e) => setForm({ ...form, cook_time_minutes: e.target.value })}
              placeholder="30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Complexity</Label>
            <Select
              value={form.difficulty}
              onValueChange={(v: Difficulty) => setForm({ ...form, difficulty: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Health level</Label>
            <Select
              value={form.health_level}
              onValueChange={(v: HealthLevel) => setForm({ ...form, health_level: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="indulgent">Indulgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Image URL (optional)</Label>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Source URL (optional)</Label>
            <Input
              value={form.source_url}
              onChange={(e) => setForm({ ...form, source_url: e.target.value })}
              placeholder="https://…"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-serif text-foreground">Ingredients</Label>
          <Button type="button" size="sm" variant="ghost" onClick={() => addItem("ingredients")}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <ul className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-xs w-6 text-muted-foreground tabular-nums">{i + 1}.</span>
              <Input
                value={ing}
                onChange={(e) => updateList("ingredients", i, e.target.value)}
                placeholder="2 cups flour"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem("ingredients", i)}
                aria-label={`Remove ingredient ${i + 1}`}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-serif text-foreground">Steps</Label>
          <Button type="button" size="sm" variant="ghost" onClick={() => addItem("steps")}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <ol className="space-y-3">
          {form.steps.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2.5 grid place-items-center size-6 shrink-0 rounded-full bg-ember-100 text-ember-700 text-xs font-semibold tabular-nums">
                {i + 1}
              </span>
              <Textarea
                value={step}
                onChange={(e) => updateList("steps", i, e.target.value)}
                placeholder="Preheat oven to 375°F…"
                className="min-h-[72px]"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem("steps", i)}
                aria-label={`Remove step ${i + 1}`}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ol>
      </section>

      <div className="sticky bottom-20 md:bottom-6 z-10">
        <div className="surface shadow-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            All recipes are public so you can share them with friends.
          </p>
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Check />}
            {saving ? "Saving…" : "Save recipe"}
          </Button>
        </div>
      </div>
    </form>
  );
}
