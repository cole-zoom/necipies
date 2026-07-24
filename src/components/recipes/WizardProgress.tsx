import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "./wizard";

// The rail shows the five content steps (ids 1–5). Step 0 ("Start fast") is a
// pre-entry screen, so nothing is active there. Completed steps are clickable
// to jump *backward* only — you can't skip ahead past a required step.
const RAIL = WIZARD_STEPS.filter((s) => s.id >= 1);

export function WizardProgress({
  step,
  onJump,
}: {
  step: number;
  onJump: (step: number) => void;
}) {
  return (
    <ol className="flex items-center gap-1 sm:gap-1.5" aria-label="Progress">
      {RAIL.map((s, i) => {
        const done = step > s.id;
        const current = step === s.id;
        return (
          <li key={s.id} className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => done && onJump(s.id)}
              disabled={!done}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pl-1 pr-1 sm:pr-2.5 text-xs font-medium transition-colors",
                current && "bg-ember-100 text-ember-700",
                done && "text-foreground hover:bg-accent cursor-pointer",
                !current && !done && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid place-items-center size-6 rounded-full text-[11px] tabular-nums",
                  current && "bg-ember-600 text-white",
                  done && "bg-ember-100 text-ember-700",
                  !current && !done && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < RAIL.length - 1 && (
              <span aria-hidden className="h-px w-2 sm:w-4 bg-border shrink-0" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
