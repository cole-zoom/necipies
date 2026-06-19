import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Recipe } from "@/types/recipe";

export type RecipeSort = "newest" | "random" | "az";

interface UseRecipesArgs {
  search?: string;
  authorId?: string | null;
  limit?: number;
  sort?: RecipeSort;
  /** Exclude seeded/curated recipes (is_seed = true). Used by My Cookbook. */
  excludeSeed?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useRecipes({
  search,
  authorId,
  limit = 60,
  sort = "newest",
  excludeSeed = false,
}: UseRecipesArgs = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // PostgREST has no clean `ORDER BY random()`. For random we order by
      // created_at (cheap, indexed), pull `limit` rows, then shuffle in JS.
      const order: { col: string; ascending: boolean } =
        sort === "az"
          ? { col: "title", ascending: true }
          : { col: "created_at", ascending: false };

      let q = supabase
        .from("recipes")
        .select("*")
        .order(order.col, { ascending: order.ascending })
        .limit(limit);

      if (authorId) q = q.eq("author_id", authorId);
      if (excludeSeed) q = q.eq("is_seed", false);
      if (search && search.trim()) {
        const term = search.trim().replace(/[%_]/g, "");
        q = q.or(
          [
            `title.ilike.%${term}%`,
            `description.ilike.%${term}%`,
            `cuisine.ilike.%${term}%`,
            `ingredients_text.ilike.%${term}%`,
          ].join(","),
        );
      }

      const { data, error: err } = await q;
      if (err) throw err;
      const rows = (data ?? []) as Recipe[];
      setRecipes(sort === "random" ? shuffle(rows) : rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [search, authorId, limit, sort, excludeSeed]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return { recipes, loading, error, refetch: fetchRecipes };
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Recipe | null;
}
