import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Recipe } from "@/types/recipe";

interface UseRecipesArgs {
  search?: string;
  authorId?: string | null;
  limit?: number;
}

export function useRecipes({ search, authorId, limit = 60 }: UseRecipesArgs = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (authorId) q = q.eq("author_id", authorId);
      if (search && search.trim()) {
        const term = search.trim().replace(/[%_]/g, "");
        // Search title, description, cuisine, ingredients (text-array OR)
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
      setRecipes((data ?? []) as Recipe[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [search, authorId, limit]);

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
