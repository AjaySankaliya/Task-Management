import { Request, Response, NextFunction } from "express";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

export const  createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const project = await Project.create({
      title,
      description,
      owner: req.userId,
      members: [req.userId], // Owner is also a member
    });

    res.status(201).json({
      success: true,
      message: "Project Created Successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projects = await Project.find({
      members: req.userId,
    }).populate("owner", "name email");

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only owner can update project",
      });
    }

    project.title = title || project.title;
    project.description = description || project.description;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project Updated Successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only owner can delete project",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only owner can add members",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === user._id.toString(),
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "User already added",
      });
    }

    project.members.push(user._id);

    await project.save();

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "members",
      "name email",
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      count: project.members.length,
      data: project.members,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only owner can remove members",
      });
    }

    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Project owner cannot be removed",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === userId,
    );

    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    project.members = project.members.filter(
      (member) => member.toString() !== userId,
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
