import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import { Discover } from "@/pages/Discover";
import { RecipeDetail } from "@/pages/RecipeDetail";
import { NewRecipe } from "@/pages/NewRecipe";
import { MyCookbook } from "@/pages/MyCookbook";
import { SignIn } from "@/pages/SignIn";
import { About } from "@/pages/About";
import { NotFound } from "@/pages/NotFound";
import { initAnalytics, trackPageView } from "@/lib/analytics";

function PageViews() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    trackPageView(pathname + search);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, search]);
  return null;
}

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <PageViews />
      <div className="min-h-dvh flex flex-col">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-1 pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/r/:slug" element={<RecipeDetail />} />
            <Route path="/new" element={<NewRecipe />} />
            <Route path="/cookbook" element={<MyCookbook />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
      </div>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }}
      />
    </TooltipProvider>
  );
}
