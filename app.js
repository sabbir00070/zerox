import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { getUser, getPhoto } from './telegram.js';
import axios from 'axios';
import connectDB from './db.js';
import User from "./Users.js";
import "./bot.js";

dotenv.config();
await connectDB();

const userSchema = new mongoose.Schema({}, { strict: false });
//const User = mongoose.model("users", userSchema, "users");

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/dashboard", async (req, res) => {
  const q = req.query.q;if (!q || q === '') {
    return res.render("error", {
      title: "404 Error",
      message: "Token is missing or empty",
      description: "Please provide a valid token to access the dashboard."
    });
  }
  
  try {
    const users4 = await getUserByToken(q);
    if (!users4) return res.status(404).send("User not found");

    const chatId = users4.chat_id;
    const userData = await getUser(chatId);
    const userPhotos = await getPhoto(chatId);
    const base644 = await base64(userPhotos);

    // Example maintenance object, you can fetch from DB later
    const maintenance = {
      m_end_time: "2026-12-20T03:00:00"
    };

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
      photo: base644,
      icon: userPhotos,
      showMaintenance: isMaintenanceActive(maintenance),
      maintenance
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    res.status(500).send("Server Error");
  }
});

app.get("/", (req, res) => res.redirect("/dashboard"));

app.post("/api-send", (req, res) => {
  res.json({
    status: true,
    message: "Succesfully message sent"
  })
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

function isMaintenanceActive(maintenance) {
  if (!maintenance || !maintenance.m_end_time) return false;
  return new Date(maintenance.m_end_time) > new Date();
}