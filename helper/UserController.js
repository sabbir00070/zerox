import User from "../Users.js";

export const checkBanByToken = async (req, res, next) => {
  const token = req.query.q || req.body.q;

  if (!token) return res.status(400).json({ status: false, message: "Token required" });

  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    if (user.banned) {
      if (req.query.q) return res.render("ban", { user });
      return res.status(403).json({ status: false, message: "You have been banned." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};