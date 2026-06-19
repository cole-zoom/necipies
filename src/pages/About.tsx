import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function About() {
  return (
    <div className="container py-12 max-w-2xl prose-ember">
      <h1 className="font-serif text-4xl tracking-tight">About this project</h1>
      <p className="text-muted-foreground mt-2 leading-relaxed">
        Necepies is a student course project. It exists so home cooks can keep recipes the way
        Notion lets you keep notes: searchable, shareable, and yours.
      </p>

      <Separator className="my-8" />

      <h2 className="font-serif text-2xl tracking-tight">What we collect</h2>
      <p className="text-muted-foreground leading-relaxed mt-2">
        To analyze how people use the app for this course, Necepies loads the following
        privacy-respecting analytics:
      </p>
      <ul className="mt-3 space-y-2 text-foreground/90 list-disc pl-5">
        <li>
          <strong>Google Analytics 4</strong> — page views, basic device info, and event
          counts (e.g. &ldquo;searched&rdquo;, &ldquo;recipe_viewed&rdquo;). IP addresses are
          anonymized.
        </li>
        {import.meta.env.VITE_CLARITY_PROJECT_ID && (
          <li>
            <strong>Microsoft Clarity</strong> — heatmaps and session replays to understand
            interaction patterns. Sensitive form fields are masked by default.
          </li>
        )}
        <li>
          <strong>Supabase</strong> — your recipe data, so it persists between sessions.
        </li>
      </ul>

      <p className="text-muted-foreground leading-relaxed mt-4">
        We do <strong>not</strong> sell data, and analytics are loaded transparently — never
        hidden inside &ldquo;agree&rdquo; modals or pre-checked boxes. If you&rsquo;d like to
        opt out, use your browser&rsquo;s tracker blocker or visit the{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noreferrer"
          className="text-ember-700 underline underline-offset-2"
        >
          Google Analytics opt-out page
        </a>
        .
      </p>

      <Separator className="my-8" />

      <h2 className="font-serif text-2xl tracking-tight">Public by design</h2>
      <p className="text-muted-foreground leading-relaxed mt-2">
        Every recipe you save is public so it can be shared with a link. Don&rsquo;t add
        anything you would not want a friend (or a curious stranger) to see.
      </p>

      <div className="mt-10">
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
