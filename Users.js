import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  chat_id: String,
  coin: { type: Number, default: 100 },
  rafer: { type: Number, default: 0 },
  token: String,
  isPremium: { type: Boolean, default: false },
  endPremium: Date,
  last_bonus: Date,
  total_bom: { type: Number, default: 0 },
  register_date: { type: Date, default: Date.now }
});

export default mongoose.models.users ||
  mongoose.model("users", userSchema, "users");