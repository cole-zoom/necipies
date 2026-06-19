import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            A calm notebook for home-cooked recipes. Capture, organize, and share what you love to cook.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-foreground text-muted-foreground" to="/discover">Discover recipes</Link></li>
            <li><Link className="hover:text-foreground text-muted-foreground" to="/new">Add a recipe</Link></li>
            <li><Link className="hover:text-foreground text-muted-foreground" to="/cookbook">My cookbook</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            About
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-foreground text-muted-foreground" to="/about">About this project</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Necipies — a student course project.</p>
          <p>Made with care · Designed for cooks.</p>
        </div>
      </div>
    </footer>
  );
}
