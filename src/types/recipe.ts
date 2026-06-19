export type Difficulty = "easy" | "medium" | "hard";
export type HealthLevel = "light" | "balanced" | "indulgent";

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  difficulty: Difficulty;
  health_level: HealthLevel;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  yield_label: string | null;
  ingredients: string[];
  steps: string[];
  tags: string[] | null;
  image_url: string | null;
  source_url: string | null;
  author_name: string | null;
  author_id: string | null;
  is_seed: boolean;
  created_at: string;
  updated_at: string;
}

export type RecipeInsert = Omit<
  Recipe,
  "id" | "created_at" | "updated_at" | "is_seed" | "slug"
> & {
  id?: string;
  slug?: string;
};

export interface ExtractedRecipe {
  title: string;
  description?: string;
  cuisine?: string;
  difficulty?: Difficulty;
  health_level?: HealthLevel;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  yield_label?: string;
  ingredients: string[];
  steps: string[];
  tags?: string[];
}
