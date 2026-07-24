import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// One-time, dismissable orientation for first-time visitors. Deliberately a
// single non-blocking card — NOT a multi-step coach-marks tour.
const STORAGE_KEY = "necipies.onboarded";

function alreadyOnboarded() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markOnboarded() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private mode / storage disabled — harmless; the prompt just reappears
    // on the next visit instead of being permanently suppressed.
  }
}

export function FirstVisitPrompt() {
  const navigate = useNavigate();
  // `render` gates DOM presence; `visible` drives the slide-in. Onboarded
  // visitors never render at all.
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);

  const close = (via: "dismiss" | "new" | "discover") => {
    markOnboarded();
    if (via === "dismiss") trackEvent("onboarding_dismissed");
    else trackEvent("onboarding_cta", { target: via });
    setVisible(false);
    // Unmount after the exit transition; harmless if navigation happens first.
    setTimeout(() => setRender(false), 200);
    if (via === "new") navigate("/new");
    if (via === "discover") navigate("/discover");
  };

  useEffect(() => {
    if (alreadyOnboarded()) return;
    setRender(true);

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    // Let the home intro settle first for motion users; show immediately for
    // reduced-motion users.
    const delay = reduce ? 0 : 900;
    const t = setTimeout(() => {
      setVisible(true);
      trackEvent("onboarding_shown");
    }, delay);
    return () => clearTimeout(t);
  }, []);

  // Esc dismisses. Registered only while rendered; not a focus trap.
  useEffect(() => {
    if (!render) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close("dismiss");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  if (!render) return null;

  return (
    <div
      role="dialog"
      aria-label="Getting started"
      className={cn(
        // Bottom-center, above the mobile bottom nav; sits under the home
        // intro overlay (z-100) so it reveals as the intro fades.
        "fixed left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2",
        "bottom-24 md:bottom-6",
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <div className="surface shadow-xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold tracking-tight text-foreground">New here?</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Snap a photo to turn any recipe into a card, or browse the pantry to explore.
            </p>
          </div>
          <button
            type="button"
            onClick={() => close("dismiss")}
            aria-label="Dismiss"
            className="shrink-0 grid place-items-center size-8 -mr-1 -mt-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>
        {/* Adjacent CTAs share one size variant (default). */}
        <div className="mt-4 flex gap-2">
          <Button size="default" className="flex-1" onClick={() => close("new")}>
            <Camera /> Add a recipe
          </Button>
          <Button
            size="default"
            variant="outline"
            className="flex-1"
            onClick={() => close("discover")}
          >
            <Search /> Browse
          </Button>
        </div>
      </div>
    </div>
  );
}
