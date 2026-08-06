import { Router } from "express";
import adminRoutes from "./adminRoutes";
import authRoutes from "./authRoutes";
import gameRoutes from "./gameRoutes";
import levelRoutes from "./levelRoutes";
import miniGameRoutes from "./miniGameRoutes";
import parentAuthRoutes from "./parentAuthRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/parents", parentAuthRoutes);
router.use("/games", gameRoutes);
router.use("/games/levels", levelRoutes);
router.use("/games", miniGameRoutes);

export default router;