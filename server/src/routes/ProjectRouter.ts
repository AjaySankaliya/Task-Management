import { Router } from "express";

import {
  addMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  removeMember,
  updateProject,
} from "../controllers/projectController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.get("/:projectId", authMiddleware, getProjectById);
router.put("/:projectId", authMiddleware, updateProject);
router.delete("/:projectId", authMiddleware, deleteProject);
router.post("/:projectId/members", authMiddleware, addMember);
router.get("/:projectId/members", authMiddleware, getProjectMembers);
router.delete("/:projectId/members/:userId", authMiddleware, removeMember);

export default router;
