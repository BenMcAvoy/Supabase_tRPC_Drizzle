import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthSession } from "@/hooks/use-auth-session";
import { supabase } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export function AuthPanel() {
  const { session, isLoading } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const result = mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setError(result.error.message);
      } else if (mode === "sign-up" && !result.data.session) {
        setNotice("Check your email to confirm your account.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setError("");

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  }

  function toggleMode() {
    setMode((currentMode) => currentMode === "sign-in" ? "sign-up" : "sign-in");
    setError("");
    setNotice("");
  }

  if (isLoading) {
    return <Card className="h-full w-full max-w-none"><CardContent className="py-6 text-sm text-muted-foreground">Loading...</CardContent></Card>;
  }

  if (session) {
    return (
      <Card className="h-full w-full max-w-none">
        <CardHeader><CardTitle>Auth status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Signed in</p>
          <p className="text-sm">{session.user.email}</p>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <Button className="w-full" variant="outline" onClick={handleSignOut}>Sign out</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full max-w-none">
      <CardHeader><CardTitle>Auth status</CardTitle></CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">Signed out</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              id="password"
              minLength={6}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          {notice && <Alert><AlertDescription>{notice}</AlertDescription></Alert>}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t text-sm text-muted-foreground">
        {mode === "sign-in" ? "Need an account?" : "Already have an account?"}
        <Button className="ml-1 h-auto px-1 py-0" onClick={toggleMode} type="button" variant="link">
          {mode === "sign-in" ? "Sign up" : "Sign in"}
        </Button>
      </CardFooter>
    </Card>
  );
}
