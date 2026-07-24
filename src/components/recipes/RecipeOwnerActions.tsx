import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Recipe } from "@/types/recipe";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

// Edit + delete, shown only to the recipe's author. Renders nothing for
// everyone else. RLS enforces the same ownership on the server.
export function RecipeOwnerActions({ recipe }: { recipe: Recipe }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!user && recipe.author_id === user.id;
  if (!isOwner) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    trackEvent("recipe_deleted", { slug: recipe.slug });
    setOpen(false);
    toast.success("Recipe deleted.");
    navigate("/cookbook");
  };

  return (
    <>
      {/* Adjacent buttons share the `default` size. */}
      <Button asChild variant="outline">
        <Link to={`/r/${recipe.slug}/edit`}>
          <Pencil className="size-4" /> Edit
        </Link>
      </Button>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" /> Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this recipe?</DialogTitle>
            <DialogDescription>
              “{recipe.title}” will be permanently removed, and its shared link
              will stop working. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
              {deleting ? "Deleting…" : "Delete recipe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
