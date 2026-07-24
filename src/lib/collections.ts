// Curated collections — the honest alternative to a fabricated "Popular"
// ranking (we have no view/like signal to rank by). These map to the REAL
// category tags already present on recipes.tags (text[]) from the seed import,
// so no backfill is needed — the data is already tagged.
//
// `tag` must match the stored value EXACTLY (case + punctuation), since the
// query uses array containment against recipes.tags.
export interface Collection {
  slug: string; // URL param value: /discover?collection=<slug>
  title: string;
  blurb: string;
  tag: string; // exact tag stored in recipes.tags
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "desserts",
    title: "Desserts",
    blurb: "Cakes, pies, cookies — the sweet end of the pantry.",
    tag: "Desserts",
  },
  {
    slug: "breakfast-and-brunch",
    title: "Breakfast & brunch",
    blurb: "Slow mornings and lazy weekend plates.",
    tag: "Breakfast and Brunch",
  },
  {
    slug: "salads",
    title: "Salads",
    blurb: "Crisp, bright, and veg-forward.",
    tag: "Salad",
  },
  {
    slug: "soups-and-stews",
    title: "Soups & stews",
    blurb: "Big pots of warm, cozy comfort.",
    tag: "Soups, Stews and Chili",
  },
  {
    slug: "small-bites",
    title: "Small bites",
    blurb: "Appetizers, snacks, and things to share.",
    tag: "Appetizers and Snacks",
  },
  {
    slug: "drinks",
    title: "Drinks",
    blurb: "Smoothies, cocktails, and everything to sip.",
    tag: "Drinks",
  },
];

export function getCollection(slug: string | null): Collection | undefined {
  if (!slug) return undefined;
  return COLLECTIONS.find((c) => c.slug === slug);
}
