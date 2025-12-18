import express from "express";
import Maintenance from "../../Maintenance.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  const maintenance = await Maintenance.findOne();
  res.render("maintenance", { maintenance });
});

router.post("/", adminAuth, async (req, res) => {
  const { enabled, title, message, start_time, end_time } = req.body;

  await Maintenance.findOneAndUpdate(
    {},
    {
      enabled: enabled === "on",
      title,
      message,
      start_time,
      end_time,
      updated_at: new Date()
    },
    { upsert: true }
  );

  res.redirect("/admin/maintenance");
});

export default router;