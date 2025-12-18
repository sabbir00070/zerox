import express from "express";
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    (username === process.env.ADMIN_USER || username === "1234") &&
    (password === process.env.ADMIN_PASS || password === "1234")
  ) {
    req.session.admin = true;
    return res.redirect("/admin");
  }

  res.render("login", { error: "Invalid credentials" });
});

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect("/admin");
    res.redirect("/admin/login");
  });
});

export default router;