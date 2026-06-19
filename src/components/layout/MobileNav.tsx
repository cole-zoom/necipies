import { NavLink } from "react-router-dom";
import { Compass, BookOpen, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/new", label: "New", icon: Plus, accent: true },
  { to: "/cookbook", label: "Cookbook", icon: BookOpen },
];

export function MobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur pb-safe"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] text-muted-foreground",
                  isActive && "text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid place-items-center rounded-xl transition-colors",
                      t.accent
                        ? "size-9 bg-primary text-primary-foreground shadow-sm"
                        : cn(
                            "size-9",
                            isActive && "bg-accent",
                          ),
                    )}
                  >
                    <t.icon className="size-4" />
                  </span>
                  <span className={cn("leading-none", t.accent && "text-foreground")}>{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
