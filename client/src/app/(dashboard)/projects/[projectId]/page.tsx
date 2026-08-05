"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getUsers } from "@/api/auth.api";
import {
  addMember,
  getProjectById,
  getProjectMembers,
  removeMember,
  type Project,
} from "@/api/project.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId;
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Array<{ _id?: string; name?: string; email?: string }>>([]);
  const [users, setUsers] = useState<Array<{ _id?: string; id?: string; name?: string; email?: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProject = async () => {
    try {
      if (!projectId) {
        setError("Project id is missing");
        setLoading(false);
        return;
      }

      setLoading(true);
      const [projectResponse, membersResponse, usersResponse] = await Promise.all([
        getProjectById(projectId),
        getProjectMembers(projectId),
        getUsers(),
      ]);

      setProject(projectResponse.data || null);
      setMembers(membersResponse.data || []);
      setUsers(usersResponse.data || []);
      setError("");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Project not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProject();
  }, [projectId]);

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    try {
      if (!projectId) {
        setError("Project id is missing");
        return;
      }

      await addMember(projectId, selectedUserId);
      setSelectedUserId("");
      await loadProject();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Unable to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      if (!projectId) {
        setError("Project id is missing");
        return;
      }

      await removeMember(projectId, userId);
      await loadProject();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Unable to remove member");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-slate-50">
        <p className="text-lg text-red-300">{error || "Project not found"}</p>
        <Link href="/projects">
          <Button>Back to projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
          <div>
            <Link href={`/projects/${projectId}/kanban`}>
              <Button>Open Board</Button>
            </Link>
          </div>
        </div>

        <Card className="mb-6 border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-3xl text-white">{project.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300">
            <p>{project.description || "No project description provided."}</p>
            <p className="text-sm text-slate-400">Owner: {project.owner?.name || "Unknown"}</p>
          </CardContent>
        </Card>

        {/* Tasks are managed on the Kanban board — use Open Board to view/manage tasks */}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Project members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {members.length === 0 ? (
                <p className="text-sm text-slate-400">No members yet.</p>
              ) : (
                members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <div>
                      <p className="font-medium text-white">{member.name || "Member"}</p>
                      <p className="text-xs text-slate-400">{member.email || "No email"}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member._id || "")}
                      className="h-8 w-8 text-slate-300 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Add member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Select a user</label>
                <select
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Choose a user</option>
                  {users
                    .filter((user) => !members.some((member) => member._id === user._id || member._id === user.id))
                    .map((user) => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.name || user.email || "User"}
                      </option>
                    ))}
                </select>
              </div>

              <Button onClick={handleAddMember} className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Add member
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
