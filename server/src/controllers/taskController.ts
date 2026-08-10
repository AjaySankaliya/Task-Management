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

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (project) filter.project = project;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate as string) };

    const tasks = await TaskQueries.findTasks(filter);

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await TaskQueries.findTaskById(req.params.id as string);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, priority, dueDate, assignee } = req.body;
    const task = await TaskCommands.updateTaskCommand(req.params.id, { title, description, status, priority, dueDate, assignee });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, message: "Task Updated Successfully", data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await TaskQueries.findTaskById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const project = await Project.findById((task.project as any)?._id || task.project);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    if (project.owner.toString() !== req.userId) return res.status(403).json({ success: false, message: "Only project owner can delete the task" });

    await TaskCommands.deleteTaskCommand(req.params.id);
    res.status(200).json({ success: true, message: "Task Deleted Successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!["todo", "in-progress", "done"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const task = await TaskCommands.updateTaskStatusCommand(req.params.id, status);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    res.status(200).json({ success: true, message: "Task status updated successfully", data: task });
  } catch (error) {
    next(error);
  }
};
