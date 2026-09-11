import prisma from "../db.js";

// REQUIRE AUTHENTICATION AND VERIFY THE USER HAS THE ADMIN ROLE.
export async function adminRequired(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.user.role = user.role;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
