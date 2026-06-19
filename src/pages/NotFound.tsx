import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="container py-24 max-w-md text-center">
      <p className="font-serif text-6xl">404</p>
      <h1 className="font-serif text-2xl mt-2">This page is off the menu</h1>
      <p className="text-muted-foreground mt-2">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </div>
  );
}
