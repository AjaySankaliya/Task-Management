"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { loginUser } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginUser({ email, password });

      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
      }

      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:login"));
      }

      router.replace("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-50">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/60">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500/20 to-sky-600/10 text-lg font-bold text-sky-300">
            TM
          </div>
          <CardTitle className="text-2xl">Task-Management</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-sky-300 hover:text-sky-200">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
