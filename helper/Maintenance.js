import Maintenance from "../Maintenance.js";

export async function getMaintenance() {
  return await Maintenance.findOne({ enabled: true }).sort({ updated_at: -1 });
}
export function isMaintenanceActive(m) {
  if (!m) return false;

  const now = new Date();
  return now >= m.start_time && now <= m.end_time;
}
export async function maintenanceGuard(req, res, next) {
  const maintenance = await getMaintenance();

  if (isMaintenanceActive(maintenance)) {
    return res.status(503).render("update", {
      title: maintenance.title,
      message: maintenance.message,
      endTime: maintenance.end_time
    });
  }

  next();
}
export async function maintenanceAPI(req, res, next) {
  const maintenance = await getMaintenance();

  if (isMaintenanceActive(maintenance)) {
    return res.status(503).json({
      status: false,
      maintenance: true,
      title: maintenance.title,
      message: maintenance.message,
      end_time: maintenance.end_time
    });
  }

  next();
}