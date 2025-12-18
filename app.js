import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { getUser, getPhoto, alertMessage } from './telegram.js';
import axios from 'axios';
import connectDB from './db.js';
import User from "./Users.js";
import { maintenanceGuard, maintenanceAPI } from "./helper/Maintenance.js";
import { checkBanByToken } from "./helper/UserController.js";
import "./bot.js";
import adminApp from "./admin/admin.js";


dotenv.config();
await connectDB();

const userSchema = new mongoose.Schema({}, { strict: false });

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", adminApp);

app.get("/dashboard", maintenanceGuard, checkBanByToken, async (req, res) => {
  const q = req.query.q;
  if (!q || q === '') {
    return res.render("error", {
      title: "404 Error",
      message: "Token is missing or empty",
      description: "Please provide a valid token to access the dashboard."
    });
  }
  try {
    const users4 = await getUserByToken(q);
    if (!users4) {
      return res.render("error", {
        title: "300",
        message: "User not found",
        description: "Please /start the bot then open."
      });
    }
    const chatId = users4.chat_id;
    const userData = await getUser(chatId);
    const userPhotos = await getPhoto(chatId);
    const base644 = await base64(userPhotos);
    res.render("dashboard", {
      title: `${userData.username} Dashboard`,
      tgUser: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username
      },
      user: {
        coin: users4.coin,
        total_bom: users4.total_bom,
        endPremium: users4.endPremium
      },
      isPremium: 1,
      chatId: users4.chat_id,
      token: users4.token,
      photo: base644,
      icon: userPhotos,
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    res.status(500).send("Server Error");
  }
});

app.get("/", (req, res) => res.redirect("/dashboard"));

const processing = new Map();

app.post("/api-send", maintenanceAPI, checkBanByToken, async (req, res) => {
  const number = req.body.phone;
  const token = req.body.q;

  if (!number || !token) {
    return res.status(400).json({ status: false, message: "Number or token is missing." });
  }

  if (processing.get(token)) {
    return res.status(429).json({ status: false, message: "Request already processing for this token." });
  }

  processing.set(token, true);

  try {
    const api = process.env.API;
    const user = await User.findOne({ token });

    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    if (user.coin <= 0) return res.status(400).json({ status: false, message: "Insufficient coins" });

    const send = await axios.get(`${api}${number}`);
    const apiData = send.data;

    let left_coin = user.coin;

    if (apiData.status === true) {
const updatedUser = await User.findOneAndUpdate(
  { token, coin: { $gte: 5 } },
  {
    $inc: {
      coin: -5,
      total_bom: +1
    }
  },
  { new: true }
);

      left_coin = updatedUser.coin;

      await alertMessage(user.chat_id, number, {
        success: true,
        coin: updatedUser.coin
      });

      return res.status(200).json({
        status: true,
        message: `Success: ${apiData.message}`,
        left_coin
      });
    } else {
      await alertMessage(user.chat_id, number, {
        success: false,
        coin: user.coin
      });

      return res.status(200).json({
        status: false,
        message: `Failed: ${apiData.message}`,
        left_coin
      });
    }

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ status: false, message: "Backend error" });
  } finally {
    processing.delete(token);
  }
});
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

async function base64(photo) {
  const res = await axios.get(photo, { responseType: "arraybuffer" });
  return Buffer.from(res.data, "binary").toString("base64");
}

async function getUserByToken(token) {
  try {
    return await User.findOne({ token });
  } catch (e) {
    console.log(`getUserByToken: ${e}`);
  }
}