import "dotenv/config";
import express from "express";
import cors from "cors";

import prisma from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

const app = express();

// TRUST THE REVERSE PROXY SO REQUEST PROTOCOL AND CLIENT IP ARE DETECTED CORRECTLY
app.set("trust proxy", 1);

// READ ALLOWED CORS ORIGINS FROM CLIENT_ORIGIN WITH LOCAL DEVELOPMENT DEFAULTS
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // ALLOW NON-BROWSER CLIENTS THAT DO NOT SEND AN ORIGIN HEADER.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

// CHECK DATABASE CONNECTIVITY FOR THE APP SERVICE HEALTH
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(503).json({ status: "degraded", db: "down" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Library API running on port ${PORT}`);
});

// CLOSE THE SERVER AND DATABASE CONNECTIONS DURING PROCESS SHUTDOWN.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, async () => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
