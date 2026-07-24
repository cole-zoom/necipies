import type { Difficulty, HealthLevel, MealType } from "@/types/recipe";

// The wizard keeps ONE flat form object (below) and only swaps which slice is
// rendered per step, so stepping back and forth never drops entered data.
export interface FormState {
  title: string;
  description: string;
  cuisine: string;
  difficulty: Difficulty;
  health_level: HealthLevel;
  prep_time_minutes: string;
  cook_time_minutes: string;
  servings: string;
  yield_label: string;
  // "" means unspecified / "Any" — stored as null on insert.
  meal_type: MealType | "";
  ingredients: string[];
  steps: string[];
  image_url: string;
  source_url: string;
  author_name: string;
}

export const emptyForm: FormState = {
  title: "",
  description: "",
  cuisine: "",
  difficulty: "easy",
  health_level: "balanced",
  prep_time_minutes: "",
  cook_time_minutes: "",
  servings: "",
  yield_label: "",
  meal_type: "",
  ingredients: [""],
  steps: [""],
  image_url: "",
  source_url: "",
  author_name: "",
};

// Step 0 ("Start fast") is a pre-entry screen — the numbered rail covers 1–5.
export const WIZARD_STEPS = [
  {
    id: 0,
    label: "Start",
    heading: "Start fast",
    subtitle: "Snap a photo to auto-fill everything, or start from scratch.",
  },
  {
    id: 1,
    label: "The dish",
    heading: "The dish",
    subtitle: "Name it and set the scene.",
  },
  {
    id: 2,
    label: "Ingredients",
    heading: "Ingredients",
    subtitle: "What goes in? One per line.",
  },
  {
    id: 3,
    label: "Steps",
    heading: "Steps",
    subtitle: "How is it made?",
  },
  {
    id: 4,
    label: "Details",
    heading: "Details",
    subtitle: "Optional — timing, cuisine, and difficulty.",
  },
  {
    id: 5,
    label: "Review",
    heading: "Review & publish",
    subtitle: "One last look before it goes live.",
  },
] as const;

export const LAST_STEP = WIZARD_STEPS.length - 1; // 5

export type StepErrors = Partial<Record<keyof FormState, string>>;

// Required-step gate. Optional steps (0, 4) always pass. Kept in one place so
// the Next button and the final submit agree on what "complete" means.
export function validateStep(
  step: number,
  form: FormState,
): { ok: boolean; errors: StepErrors } {
  const errors: StepErrors = {};
  if (step === 1 && !form.title.trim()) {
    errors.title = "Please give your recipe a title.";
  }
  if (step === 2 && !form.ingredients.some((s) => s.trim())) {
    errors.ingredients = "Add at least one ingredient.";
  }
  if (step === 3 && !form.steps.some((s) => s.trim())) {
    errors.steps = "Add at least one step.";
  }
  return { ok: Object.keys(errors).length === 0, errors };
}
