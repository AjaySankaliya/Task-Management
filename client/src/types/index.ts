export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  owner: User | string;
  members: User[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;

  status: "todo" | "in-progress" | "done";

  priority: "low" | "medium" | "high";

  dueDate: string;

  project: Project | string;

  assignee: User | string;

  createdAt?: string;
  updatedAt?: string;
}
