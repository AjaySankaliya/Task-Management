import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRouter";
import projectRoutes from "./routes/ProjectRouter";
import taskRoutes from "./routes/taskRouter";
import { errorMiddleware } from "./middleware/errorMiddleware";

const app = express();

app.use(cors({
    origin: process.env.NEXT_PUBLIC_API_URL,
    credentials:true
}));

app.use(express.json());

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