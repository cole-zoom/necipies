import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Plus, Search, BookOpen, Compass, LogOut, LogIn } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/cookbook", label: "My cookbook", icon: BookOpen },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    isActive && "text-foreground bg-accent/70",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="hidden sm:inline-flex"
            onClick={() => navigate("/discover?focus=1")}
          >
            <Search />
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/new">
              <Plus className="size-4" />
              New recipe
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[82%] max-w-xs">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] text-muted-foreground hover:bg-accent",
                        isActive && "bg-accent text-foreground",
                      )
                    }
                  >
                    <l.icon className="size-4" />
                    {l.label}
                  </NavLink>
                ))}
                <Link
                  to="/new"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] text-foreground bg-ember-100 mt-2"
                >
                  <Plus className="size-4" />
                  New recipe
                </Link>
              </div>
              <div className="mt-6 pt-6 border-t border-border/70">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => signOut()}
                  >
                    <LogOut /> Sign out
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/signin">
                      <LogIn /> Sign in
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop user menu */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full pl-1 pr-3">
                    <span className="grid place-items-center size-7 rounded-full bg-ember-100 text-ember-700 text-xs font-semibold">
                      {(user.email ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-xs truncate max-w-[120px]">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/cookbook")}>
                    <BookOpen className="size-4" /> My cookbook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
