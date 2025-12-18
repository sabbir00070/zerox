import express from "express";
import User from "../../Users.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  const users = await User.find().sort({ register_date: -1 });
  res.render("users", { users });
});

router.get("/:id", adminAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("edit-user", { user });
});

router.post("/:id", adminAuth, async (req, res) => {
  const { coin, banned, isPremium } = req.body;
  await User.findByIdAndUpdate(req.params.id, {
    coin,
    banned: banned === "on",
    isPremium: isPremium === "on"
  });
  res.redirect("/admin/users");
});

export default router;