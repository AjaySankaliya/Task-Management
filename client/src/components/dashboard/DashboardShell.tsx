import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DashboardShell() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 px-6 py-10 shadow-2xl shadow-slate-950/20 backdrop-blur sm:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Workspace dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Build better work with a modern task hub.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Your workspace is ready. Browse projects, plan work in kanban boards, and keep every task moving forward.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card className="border-slate-800 bg-slate-950/80 p-6">
              <CardHeader className="p-0">
                <CardTitle className="text-base text-slate-300">Welcome back</CardTitle>
              </CardHeader>
              <CardContent className="mt-4 p-0 text-sm leading-6 text-slate-400">
                <p className="text-xl font-semibold text-white">{user?.name || "Team member"}</p>
                <p className="mt-2">Manage your active projects and keep your team aligned.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-950/80 p-6">
              <CardHeader className="p-0">
                <CardTitle className="text-base text-slate-300">Workspace status</CardTitle>
              </CardHeader>
              <CardContent className="mt-4 p-0 text-sm leading-6 text-slate-400">
                <p className="text-xl font-semibold text-sky-300">Healthy</p>
                <p className="mt-2">Everything is connected and ready for your next sprint.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-950/80 p-6">
              <CardHeader className="p-0">
                <CardTitle className="text-base text-slate-300">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="mt-4 p-0 text-sm leading-6 text-slate-400">
                <p className="text-white">Jump to project management, kanban boards, or new task creation.</p>
                <Button asChild className="mt-4">
                  <Link href="/projects">Create project</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
