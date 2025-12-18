import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  title: String,
  message: String,
  start_time: Date,
  end_time: Date,
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("Maintenance", maintenanceSchema, "maintenance");