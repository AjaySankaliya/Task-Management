"use client";

import { useEffect, useState } from "react";

import { getProjects } from "@/api/project.api";

export default function ProjectsPage() {
  const [projects, setProjects] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const data = await getProjects();

        setProjects(data.data || []);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Projects</h1>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <div key={project._id}>
            <h2>{project.title}</h2>

            <p>
              {project.description}
            </p>
          </div>
        ))
      )}
    </div>
  );
}