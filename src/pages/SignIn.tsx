import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function SignIn() {
  const { user, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/cookbook");
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    const { error } = await signInWithEmail(email);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="container py-14 max-w-md">
      <div className="surface p-8 animate-fade-in">
        <div className="size-10 grid place-items-center rounded-xl bg-ember-100 text-ember-700 mb-4">
          <Mail />
        </div>
        <h1 className="font-serif text-3xl tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Magic links only — no passwords to remember.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-border bg-cream-50 p-4 text-sm">
            <p>
              We sent a sign-in link to <strong>{email}</strong>. Open it on this device
              to land in your cookbook.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@home.kitchen"
                className="h-11"
              />
            </div>
            <Button type="submit" size="lg" disabled={busy} className="w-full">
              {busy ? <Loader2 className="animate-spin" /> : <Mail />}
              {busy ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
