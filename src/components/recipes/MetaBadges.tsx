import { Clock, ChefHat, Leaf, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Difficulty, HealthLevel } from "@/types/recipe";
import { formatMinutes } from "@/lib/utils";

export function DifficultyBadge({ value }: { value: Difficulty }) {
  const map: Record<Difficulty, { label: string; variant: "green" | "amber" | "rose" }> = {
    easy: { label: "Easy", variant: "green" },
    medium: { label: "Medium", variant: "amber" },
    hard: { label: "Hard", variant: "rose" },
  };
  const m = map[value];
  return (
    <Badge variant={m.variant}>
      <ChefHat className="size-3" /> {m.label}
    </Badge>
  );
}

export function HealthBadge({ value }: { value: HealthLevel }) {
  const map: Record<HealthLevel, { label: string; variant: "green" | "amber" | "ember" }> = {
    light: { label: "Light", variant: "green" },
    balanced: { label: "Balanced", variant: "amber" },
    indulgent: { label: "Indulgent", variant: "ember" },
  };
  const m = map[value];
  return (
    <Badge variant={m.variant}>
      <Leaf className="size-3" /> {m.label}
    </Badge>
  );
}

export function TimeBadge({ minutes }: { minutes?: number | null }) {
  return (
    <Badge variant="muted">
      <Clock className="size-3" /> {formatMinutes(minutes)}
    </Badge>
  );
}

export function ServingsBadge({ value }: { value?: number | null }) {
  if (!value) return null;
  return (
    <Badge variant="muted">
      <Users className="size-3" /> {value}
    </Badge>
  );
}
