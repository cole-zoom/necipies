import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractRecipeFromImage } from "@/lib/gemini";
import type { ExtractedRecipe } from "@/types/recipe";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface Props {
  onExtracted: (recipe: ExtractedRecipe) => void;
}

export function PhotoExtract({ onExtracted }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    trackEvent("extract_recipe_start");
    try {
      const r = await extractRecipeFromImage(file);
      trackEvent("extract_recipe_success");
      onExtracted(r);
      toast.success("Recipe extracted — review and save.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Extraction failed";
      trackEvent("extract_recipe_error", { message: msg });
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-ember-200 bg-ember-50/60 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center size-10 rounded-xl bg-ember-100 text-ember-700 shrink-0">
          <Sparkles className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-foreground">Snap a recipe to fill it in</h3>
            <span className="text-[11px] uppercase tracking-wider bg-ember-100 text-ember-700 px-1.5 py-0.5 rounded">
              Gemini
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload a photo of a cookbook page, handwritten card, or screenshot. We&rsquo;ll parse the ingredients, steps and timing for you to edit.
          </p>

          {preview && (
            <div className="mt-3 relative inline-block">
              <img
                src={preview}
                alt="Selected recipe"
                className="max-h-40 rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Clear preview"
                className="absolute -top-2 -right-2 size-6 rounded-full bg-background border border-border grid place-items-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              {busy ? "Reading…" : "Upload photo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraRef.current?.click()}
              disabled={busy}
              className="sm:hidden"
            >
              <Camera /> Take photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
