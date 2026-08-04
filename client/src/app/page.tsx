"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [loading, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
      Loading...
    </div>
  );
}