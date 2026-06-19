import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "necepies.disclaimer.dismissed.v1";

export function DisclaimerBanner() {
  // Visible by default. Persists dismissal in localStorage so it's not nagging,
  // but the full notice is always available at /about. No dark patterns: dismiss
  // is a labeled button, and dismissing does not opt you in to anything you
  // were not already informed of.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Course project disclaimer"
      className="w-full bg-ember-50 border-b border-ember-200/80 text-ember-700"
    >
      <div className="container py-2.5 flex items-start sm:items-center gap-3 text-[13px] leading-snug">
        <Info className="size-4 mt-0.5 sm:mt-0 shrink-0" />
        <p className="flex-1">
          <strong className="font-semibold">Heads up:</strong> Necepies is a
          student course project. To study how people use it, this site collects
          anonymous usage data — page visits, clicks, and similar interactions —
          via Google Analytics{" "}
          {import.meta.env.VITE_CLARITY_PROJECT_ID ? "and Microsoft Clarity" : ""}.
          <Link
            to="/about"
            className="underline underline-offset-2 ml-1 font-medium hover:text-ember-600"
          >
            Read the full notice
          </Link>
          .
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-ember-700 hover:text-ember-600 hover:bg-ember-100"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setDismissed(true);
          }}
        >
          Dismiss <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
