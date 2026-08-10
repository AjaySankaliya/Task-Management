import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRouter";
import projectRoutes from "./routes/ProjectRouter";
import taskRoutes from "./routes/taskRouter";
import { errorMiddleware } from "./middleware/errorMiddleware";
import logger from "./utils/logger";

const app = express();
app.use(cors());

app.use(express.json());

// request logging
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Management API is running"
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);

app.use(errorMiddleware);

export default app;