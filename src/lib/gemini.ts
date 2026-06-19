import type { ExtractedRecipe } from "@/types/recipe";

async function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      const [meta, b64] = result.split(",", 2);
      const mime = /data:([^;]+);base64/.exec(meta ?? "")?.[1] ?? file.type ?? "image/jpeg";
      resolve({ data: b64, mimeType: mime });
    };
    reader.readAsDataURL(file);
  });
}

export async function extractRecipeFromImage(file: File): Promise<ExtractedRecipe> {
  const { data, mimeType } = await fileToBase64(file);
  const res = await fetch("/api/extract-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: data, mimeType }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Extract failed (${res.status}): ${msg || "unknown error"}`);
  }
  return (await res.json()) as ExtractedRecipe;
}
