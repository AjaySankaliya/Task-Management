import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  me,
  logout,
  getUsers,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../utils/validate";
import { loginSchema, registerSchema } from "../validation/authValidation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);
router.get("/", authMiddleware, getUsers);

export default router;
