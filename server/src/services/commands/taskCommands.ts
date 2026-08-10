import Task from "../../models/Task";

export const createTaskCommand = async (payload: any) => {
  const task = await Task.create(payload);
  return task;
};

export const updateTaskCommand = async (id: string, payload: any) => {
  const task = await Task.findById(id);
  if (!task) return null;
  Object.assign(task, payload);
  await task.save();
  return task;
};

export const deleteTaskCommand = async (id: string) => {
  const task = await Task.findById(id);
  if (!task) return null;
  await task.deleteOne();
  return true;
};

export const updateTaskStatusCommand = async (id: string, status: string) => {
  const task = await Task.findById(id);
  if (!task) return null;
  task.status = status as any;
  await task.save();
  return task;
};
