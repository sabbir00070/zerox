import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/admin.auth.js";
import userRoutes from "./routes/admin.users.js";
import maintenanceRoutes from "./routes/admin.maintenance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminApp = express();
adminApp.set("views", path.join(__dirname, "views"));
adminApp.set("view engine", "ejs");
adminApp.use(session({
  secret: "zerox-admin",
  resave: false,
  saveUninitialized: false
}));
adminApp.use(express.urlencoded({ extended: true }));

adminApp.use("/", authRoutes);           
adminApp.use("/users", userRoutes);     
adminApp.use("/maintenance", maintenanceRoutes);
adminApp.get("/", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");
  res.render("dashboard");
});

export default adminApp;