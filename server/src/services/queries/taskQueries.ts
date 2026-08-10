import Task from "../../models/Task";

export const findTasks = async (filter: any = []) => {
  const tasks = await Task.find(filter).populate("project", "title").populate("assignee", "name email");
  return tasks;
};

export const findTaskById = async (id: string) => {
  const task = await Task.findById(id).populate("project", "title").populate("assignee", "name email");
  return task;
};
