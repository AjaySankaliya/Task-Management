import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardShell() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Welcome back, {user?.name || "User"}
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>Name: {user?.name || "-"}</p>
              <p>Email: {user?.email || "-"}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Your session is active and authenticated via the server.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
