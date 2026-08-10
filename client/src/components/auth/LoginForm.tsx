"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { loginUser } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/auth/google`;

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
      const axiosError = err as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        (err instanceof Error ? err.message : "Login failed.");
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
            TF
          </div>
          <CardTitle className="text-2xl">TaskFlow</CardTitle>
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

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="h-px flex-1 bg-slate-700" />
              <span>or</span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>

            <a
              href={googleAuthUrl}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-700 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.53Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.41 13.91A6.02 6.02 0 0 1 6.41 10.1V7.52H3.07a10 10 0 0 0 0 12.78l3.34-2.59Z" />
                <path fill="#EA4335" d="M12 6.08c1.47 0 2.79.5 3.83 1.49l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.52l3.34 2.59C7.2 7.84 9.4 6.08 12 6.08Z" />
              </svg>
              <span>Continue with Google</span>
            </a>
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
