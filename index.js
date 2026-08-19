// =========================================================================
// CORE ENGINE HOST: index.js
// Description: Main entry point for the Busiswa Back-End HR Operations API.
//              Handles routing, global error filtering, and database checks.
// Stack Architecture: Node.js + Express (ES Modules) + MySQL
// =========================================================================

import express from "express";
import db from "./src/config/db.js";

// Route Imports - Explicitly including extensions to satisfy ES Module specs
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import leaveRoutes from "./src/routes/leaveRoutes.js";
import timeoffRoutes from "./src/routes/timeoffRoutes.js";
import issuesRoutes from "./src/routes/issuesRoutes.js";

const app = express();

// Global Middleware Configuration
app.use(express.json()); // Parses structured incoming payload message blocks

// Relational API Module Mounting Paths
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/timeoff", timeoffRoutes);
app.use("/api/issues", issuesRoutes);

// Base System Status Check Endpoint Layout
app.get("/", (req, res) => {
  return res.status(200).json({
    status: "Healthy",
    timestamp: new Date(),
    service: "ModernTech Back-End Operations API Layer",
  });
});

// Centralized Catch-All Error Handling Middleware Pipeline
app.use((err, req, res, next) => {
  console.error("Unhandled System Exception:", err.stack);
  return res.status(500).json({
    message: "A critical internal error occurred on the central server engine.",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 3000;

// Setup server listen loop to format address strings cleanly into links
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  try {
    // Quick validation check to confirm active pool query handling before accepting data
    await db.execute("SELECT 1");
    console.log(
      "MySQL connection verified successfully against moderntech_db!",
    );
  } catch (dbError) {
    console.error(
      "🚨 CRITICAL ERROR: Database verification mapping failed:",
      dbError.message,
    );
  }
});
