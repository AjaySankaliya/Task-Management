"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type Project,
  type ProjectInput,
} from "@/api/project.api";
// task APIs are used on task screens; not needed on project list
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm = { title: "", description: "" };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      setProjects(response.data || []);
      setError("");
      // nothing extra to load here
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);



  

  useEffect(() => {
    const t = setTimeout(() => { void fetchProjects(); }, 0);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  const openCreateDialog = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setForm({ title: project.title, description: project.description || "" });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Project title is required");
      return;
    }

    try {
      setSaving(true);
      if (editingProject) {
        await updateProject(editingProject._id, { title: form.title, description: form.description });
      } else {
        await createProject({ title: form.title, description: form.description });
      }

      setIsOpen(false);
      setForm(emptyForm);
      setEditingProject(null);
      await fetchProjects();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Project action failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await deleteProject(projectId);
      await fetchProjects();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Unable to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-4xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-lg sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Workspace</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Projects</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Organize work by project, collaborate with your team, and open kanban boards instantly.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                New project
              </Button>
              <span className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                {projects.length} project{projects.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="sr-only">Open project modal</Button>
          </DialogTrigger>
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-50 shadow-2xl shadow-slate-950/30">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit project" : "Create project"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project name</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Website redesign"
                  className="border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Brief overview of the project"
                  className="border-slate-700 bg-slate-950 text-white"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingProject ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-300">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed border-slate-700 bg-slate-900/60">
            <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-300">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">No projects yet</h2>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Start by creating your first project and keep your work organized.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project._id} className="border-slate-800 bg-slate-900/80 transition hover:border-sky-500/40 hover:shadow-xl hover:shadow-slate-950/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Project</p>
                      <Link href={`/projects/${project._id}`} className="mt-2 block text-xl font-semibold text-white hover:text-sky-300">
                        {project.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.preventDefault();
                          openEditDialog(project);
                        }}
                        className="h-8 w-8 text-slate-300 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.preventDefault();
                          handleDelete(project._id);
                        }}
                        className="h-8 w-8 text-slate-300 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Link href={`/projects/${project._id}`} className="block">
                    <p className="min-h-11 text-sm leading-6 text-slate-300">
                      {project.description || "No description yet."}
                    </p>
                  </Link>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>{project.members?.length || 0} members</span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span>{project.owner?.name || "Owner"}</span>
                      <Link href={`/projects/${project._id}/kanban`}>
                        <Button size="sm" className="ml-0 sm:ml-2">Open Board</Button>
                      </Link>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}