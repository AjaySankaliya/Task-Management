import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

import * as TaskQueries from "../services/queries/taskQueries";
import * as TaskCommands from "../services/commands/taskCommands";
import Project from "../models/Project";
import { User } from "../models/User";

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, status, priority, dueDate, project, assignee } = req.body;

    if (!title || !project || !assignee) {
      return res.status(400).json({ success: false, message: "Title, project and assignee are required" });
    }

    const projectData = await Project.findById(project);
    if (!projectData) return res.status(404).json({ success: false, message: "Project not found" });

    const isMember = projectData.members.some((member) => member.toString() === req.userId);
    if (!isMember) return res.status(403).json({ success: false, message: "You are not a project member" });

    const user = await User.findById(assignee);
    if (!user) return res.status(404).json({ success: false, message: "Assignee not found" });

    const isAssigneeMember = projectData.members.some((member) => member.toString() === assignee);
    if (!isAssigneeMember) return res.status(400).json({ success: false, message: "Assignee is not a project member" });

    const task = await TaskCommands.createTaskCommand({ title, description, status, priority, dueDate, project, assignee });

    res.status(201).json({ success: true, message: "Task created successfully", data: task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status, priority, dueDate, assignee, project } = req.query;

    const filter: any = {};
    const toStringValue = (value: string | string[] | undefined): string | undefined => {
      if (Array.isArray(value)) return value[0];
      return typeof value === "string" ? value : undefined;
    };

    const searchValue = toStringValue(search as string | string[] | undefined);
    const statusValue = toStringValue(status as string | string[] | undefined);
    const priorityValue = toStringValue(priority as string | string[] | undefined);
    const assigneeValue = toStringValue(assignee as string | string[] | undefined);
    const projectValue = toStringValue(project as string | string[] | undefined);
    const dueDateValue = toStringValue(dueDate as string | string[] | undefined);

    if (searchValue) {
      filter.$or = [{ title: { $regex: searchValue, $options: "i" } }, { description: { $regex: searchValue, $options: "i" } }];
    }
    if (statusValue) filter.status = statusValue;
    if (priorityValue) filter.priority = priorityValue;
    if (assigneeValue) filter.assignee = assigneeValue;
    if (projectValue) filter.project = projectValue;
    if (dueDateValue) filter.dueDate = { $lte: new Date(dueDateValue) };

    const tasks = await TaskQueries.findTasks(filter);

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

const getRouteParamId = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = getRouteParamId(req.params.id);
    if (!taskId) return res.status(400).json({ success: false, message: "Task id is required" });

    const task = await TaskQueries.findTaskById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, priority, dueDate, assignee } = req.body;
    const taskId = getRouteParamId(req.params.id);
    if (!taskId) return res.status(400).json({ success: false, message: "Task id is required" });

    const task = await TaskCommands.updateTaskCommand(taskId, { title, description, status, priority, dueDate, assignee });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, message: "Task Updated Successfully", data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = getRouteParamId(req.params.id);
    if (!taskId) return res.status(400).json({ success: false, message: "Task id is required" });

    const task = await TaskQueries.findTaskById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const project = await Project.findById((task.project as any)?._id || task.project);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    if (project.owner.toString() !== req.userId) return res.status(403).json({ success: false, message: "Only project owner can delete the task" });

    await TaskCommands.deleteTaskCommand(taskId);
    res.status(200).json({ success: true, message: "Task Deleted Successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const taskId = getRouteParamId(req.params.id);
    if (!taskId) return res.status(400).json({ success: false, message: "Task id is required" });
    if (!["todo", "in-progress", "done"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const task = await TaskCommands.updateTaskStatusCommand(taskId, status);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    res.status(200).json({ success: true, message: "Task status updated successfully", data: task });
  } catch (error) {
    next(error);
  }
};
