import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

export function ShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/r/${slug}` : "";

  const handle = async () => {
    trackEvent("share_recipe", { slug });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} — Necepies`,
          text: `Check out this recipe: ${title}`,
          url,
        });
        return;
      } catch {
        // user canceled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Long-press the link to share it.");
    }
  };

  return (
    <Button variant="secondary" onClick={handle} className="gap-2">
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "Copied" : "Share"}
      <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground text-xs ml-1 border-l border-border/80 pl-2">
        <Link2 className="size-3" />
        /r/{slug}
      </span>
    </Button>
  );
}
