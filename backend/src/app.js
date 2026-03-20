import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

//Load env variables from .env file
dotenv.config();

const app = express();

//Middleware

//parse JSON request body
app.use(express.json());

//Parse URL-encoded from data
app.use(express.urlencoded({ extended: true }));

//CORS - allow requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, //Allow cookies to be sent in cross-origin requests
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//ROUTES
app.use("/api/auth", authRoutes);

//Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

//404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

//Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  //prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({ message: "Resource already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Resource not found" });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});

export default app;
