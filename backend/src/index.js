//Busiswa imports
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import timeoffRoutes from "./routes/timeoffRoutes.js";
import issuesRoutes from "./routes/issuesRoutes.js";

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5500" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

//Busiswa route mounting
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/timeoff", timeoffRoutes);
app.use("/api/issues", issuesRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/performance", performanceRoutes);
// Mount attendanceRoutes / leaveRoutes here as your teammates build out
// their controllers, following the same pattern.

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Must be registered LAST.
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));

export default app;
