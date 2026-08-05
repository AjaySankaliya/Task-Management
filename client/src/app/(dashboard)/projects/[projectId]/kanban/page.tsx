"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById } from "@/api/project.api";
import { getTasks, type Task } from "@/api/task.api";

export default function ProjectKanbanPage() {
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId;
  const router = useRouter();

  const [project, setProject] = useState<any | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const p = await getProjectById(projectId);
        setProject(p.data || null);
        const t = await getTasks({ project: projectId });
        setTasks(t.data || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [projectId]);

  const columns = useMemo(() => ({
    todo: tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    done: tasks.filter((t) => t.status === "done"),
  }), [tasks]);

  if (!projectId) return <div className="p-6">Project id missing</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{project?.title || "Project"}</h2>
            <p className="text-sm text-slate-400">Kanban board</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/projects/${projectId}/tasks/new`}>
              <Button>Add Task</Button>
            </Link>
            <Button variant="secondary" onClick={() => router.back()}>Back</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(["todo", "in-progress", "done"] as const).map((col) => (
            <Card key={col} className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{col.replace("-", " ")}</span>
                  <span className="text-sm text-slate-400">{columns[col].length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : columns[col].length === 0 ? (
                  <p className="text-sm text-slate-400">No tasks</p>
                ) : (
                  columns[col].map((t) => (
                    <Link key={t._id} href={`/projects/${projectId}/tasks/${t._id}`} className="block">
                      <div className="mb-2 rounded-md border border-slate-800 bg-slate-950/50 p-3 hover:border-sky-500/40">
                        <div className="flex items-center justify-between">
                          <h3 className="truncate text-sm font-medium text-white">{t.title}</h3>
                          <div className="text-xs text-slate-400">{t.priority || ""}</div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                          <span>{((t.assignee as any)?.name) || "Unassigned"}</span>
                          <span>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ""}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
