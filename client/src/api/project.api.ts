import api from "@/lib/axios";

export type ProjectInput = {
  title: string;
  description?: string;
};

export type Project = {
  _id: string;
  title: string;
  description?: string;
  owner?: {
    name?: string;
    email?: string;
  };
  members?: Array<{ _id?: string; name?: string; email?: string }>;
  createdAt?: string;
  updatedAt?: string;
};

export const createProject = async (data: ProjectInput) => {
  const { data: response } = await api.post("/projects", data);
  return response;
};

export const getProjects = async () => {
  const { data } = await api.get("/projects");
  return data;
};

export const getProjectById = async (projectId: string) => {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
};

export const getProjectMembers = async (projectId: string) => {
  const { data } = await api.get(`/projects/${projectId}/members`);
  return data;
};

export const addMember = async (projectId: string, userId: string) => {
  const { data } = await api.post(`/projects/${projectId}/members`, { userId });
  return data;
};

export const removeMember = async (projectId: string, userId: string) => {
  const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
  return data;
};

export const updateProject = async (projectId: string, data: ProjectInput) => {
  const { data: response } = await api.put(`/projects/${projectId}`, data);
  return response;
};

export const deleteProject = async (projectId: string) => {
  const { data } = await api.delete(`/projects/${projectId}`);
  return data;
};