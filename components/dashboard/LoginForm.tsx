"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      setIsPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-foreground">Connexion</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-foreground">
              Adresse e-mail
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyste@blyanalytics.com"
              className="rounded-md"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-foreground">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
