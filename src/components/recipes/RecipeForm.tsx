import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
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
import {
  emptyForm,
  validateStep,
  WIZARD_STEPS,
  LAST_STEP,
  type FormState,
  type StepErrors,
} from "./wizard";
import { WizardProgress } from "./WizardProgress";
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

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
const HEALTH_LABEL: Record<HealthLevel, string> = {
  light: "Light",
  balanced: "Balanced",
  indulgent: "Indulgent",
};

// Required-field marker used on the labels the wizard gates on.
function Req() {
  return (
    <span className="text-ember-600" aria-hidden>
      {" "}
      *
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {msg}
    </p>
  );
}

export function RecipeForm({ initial }: { initial?: Partial<Recipe> }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
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
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const meta = WIZARD_STEPS[step];

  // Move focus (and the viewport) to the step heading on every step change so
  // keyboard and screen-reader users land at the top of the new step.
  useEffect(() => {
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    trackEvent("create_step_view", { step });
  }, [step]);

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
    // Land the user on step 1 so they review what was parsed.
    setErrors({});
    setStep(1);
  };

  const next = () => {
    const { ok, errors: e } = validateStep(step, form);
    if (!ok) {
      setErrors(e);
      trackEvent("create_step_blocked", { step });
      const first = Object.values(e)[0];
      if (first) toast.error(first);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  // Jump is wired to the progress rail, which only offers completed (earlier)
  // steps — so this is always a backward move.
  const goTo = (target: number) => {
    setErrors({});
    setStep(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only the review step submits; Enter on earlier steps must not save.
    if (step !== LAST_STEP) {
      next();
      return;
    }

    const cleanedIngredients = form.ingredients.map((s) => s.trim()).filter(Boolean);
    const cleanedSteps = form.steps.map((s) => s.trim()).filter(Boolean);

    // Safety net: re-check every required step before insert and bounce the
    // user to the first offending step if something is missing.
    for (const s of [1, 2, 3]) {
      const { ok, errors: e2 } = validateStep(s, form);
      if (!ok) {
        setErrors(e2);
        setStep(s);
        const first = Object.values(e2)[0];
        if (first) toast.error(first);
        return;
      }
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

  const cleanedIngredients = form.ingredients.map((s) => s.trim()).filter(Boolean);
  const cleanedSteps = form.steps.map((s) => s.trim()).filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <WizardProgress step={step} onJump={goTo} />

      <div key={step} className="animate-fade-in space-y-6">
        <div className="space-y-1">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xl sm:text-2xl font-semibold tracking-tight outline-none"
          >
            {meta.heading}
          </h2>
          <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
        </div>

        {/* Step 0 — Start fast */}
        {step === 0 && (
          <div className="space-y-4">
            <PhotoExtract onExtracted={fillFromExtracted} />
            <p className="text-sm text-muted-foreground">
              No photo handy? Use{" "}
              <span className="font-medium text-foreground">Start from scratch</span>{" "}
              below and type it in — it only takes a minute.
            </p>
          </div>
        )}

        {/* Step 1 — The dish */}
        {step === 1 && (
          <section className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title
                <Req />
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Grandma's apple pie"
                className="h-12 text-lg font-medium tracking-tight"
                aria-invalid={!!errors.title}
                autoFocus
              />
              <FieldError msg={errors.title} />
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
            <div className="space-y-1.5">
              <Label>Image URL (optional)</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goTo(0)}
              >
                <Camera className="size-4" /> Scan a photo instead
              </Button>
            </div>
          </section>
        )}

        {/* Step 2 — Ingredients */}
        {step === 2 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold tracking-tight text-foreground">
                Ingredients
                <Req />
              </Label>
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
                    autoFocus={i === 0}
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
            <FieldError msg={errors.ingredients} />
          </section>
        )}

        {/* Step 3 — Steps */}
        {step === 3 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold tracking-tight text-foreground">
                Steps
                <Req />
              </Label>
              <Button type="button" size="sm" variant="ghost" onClick={() => addItem("steps")}>
                <Plus className="size-4" /> Add
              </Button>
            </div>
            <ol className="space-y-3">
              {form.steps.map((stepText, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2.5 grid place-items-center size-6 shrink-0 rounded-full bg-ember-100 text-ember-700 text-xs font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <Textarea
                    value={stepText}
                    onChange={(e) => updateList("steps", i, e.target.value)}
                    placeholder="Preheat oven to 375°F…"
                    className="min-h-[72px]"
                    autoFocus={i === 0}
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
            <FieldError msg={errors.steps} />
          </section>
        )}

        {/* Step 4 — Details (all optional) */}
        {step === 4 && (
          <section className="grid gap-4">
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

            <div className="space-y-1.5">
              <Label>Source URL (optional)</Label>
              <Input
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </section>
        )}

        {/* Step 5 — Review */}
        {step === 5 && (
          <section className="space-y-6">
            <div className="surface p-5 space-y-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {form.title.trim() || "Untitled recipe"}
                </h3>
                {form.description.trim() && (
                  <p className="text-sm text-muted-foreground mt-1">{form.description.trim()}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {form.cuisine.trim() && <span>{form.cuisine.trim()}</span>}
                <span>{DIFFICULTY_LABEL[form.difficulty]}</span>
                <span>{HEALTH_LABEL[form.health_level]}</span>
                {form.servings && <span>{form.servings} servings</span>}
                {form.prep_time_minutes && <span>Prep {form.prep_time_minutes}m</span>}
                {form.cook_time_minutes && <span>Cook {form.cook_time_minutes}m</span>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Ingredients ({cleanedIngredients.length})
                  </p>
                  <ul className="space-y-1 text-sm list-disc pl-4">
                    {cleanedIngredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Steps ({cleanedSteps.length})
                  </p>
                  <ol className="space-y-1 text-sm list-decimal pl-4">
                    {cleanedSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              All recipes are public so you can share them with friends. Need to change
              something? Use the steps above to go back.
            </p>
          </section>
        )}
      </div>

      {/* Sticky nav footer — Back / Next share one size variant (lg). */}
      <div className="sticky bottom-20 md:bottom-6 z-10">
        <div className="surface shadow-xl px-4 py-3 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={back}>
              <ChevronLeft /> Back
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {WIZARD_STEPS.length}
            </p>
          )}

          {step < LAST_STEP ? (
            <Button type="button" size="lg" onClick={next}>
              {step === 0 ? "Start from scratch" : "Next"}
              <ChevronRight />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Check />}
              {saving ? "Saving…" : "Save recipe"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
