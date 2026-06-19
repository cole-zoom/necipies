import { Link } from "react-router-dom";

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 group ring-focus rounded-md"
      aria-label="Necepies — home"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ember-100 text-ember-700 transition-transform group-hover:-rotate-3">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            d="M5 4h10a5 5 0 0 1 5 5v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Z"
            fill="currentColor"
            opacity="0.18"
          />
          <path
            d="M5 4h10a5 5 0 0 1 5 5v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
          />
          <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      {withText && (
        <span className="flex items-baseline gap-1">
          <span className="font-serif text-[22px] leading-none text-foreground tracking-tight">
            Necepies
          </span>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            cookbook
          </span>
        </span>
      )}
    </Link>
  );
}
