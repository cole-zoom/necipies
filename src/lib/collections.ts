// Editorially curated collections — the honest alternative to a fabricated
// "Popular" ranking (we have no view/like signal to rank by). Each collection
// maps to a tag stored in recipes.tags (text[]); membership is set by hand via
// docs/prd/PRD-4-collections.sql, not by a metric.
export interface Collection {
  slug: string; // URL param value: /discover?collection=<slug>
  title: string;
  blurb: string;
  tag: string; // matched against recipes.tags
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "weeknight-dinners",
    title: "Weeknight dinners",
    blurb: "Fast, low-fuss mains for busy evenings.",
    tag: "weeknight",
  },
  {
    slug: "comfort-food",
    title: "Comfort food",
    blurb: "Warm, cozy, and unapologetically hearty.",
    tag: "comfort",
  },
  {
    slug: "crowd-pleasers",
    title: "Crowd-pleasers",
    blurb: "Sure-thing dishes for a table full of people.",
    tag: "crowd-pleaser",
  },
  {
    slug: "fresh-and-light",
    title: "Fresh & light",
    blurb: "Bright, veg-forward plates that don't weigh you down.",
    tag: "fresh",
  },
];

export function getCollection(slug: string | null): Collection | undefined {
  if (!slug) return undefined;
  return COLLECTIONS.find((c) => c.slug === slug);
}
