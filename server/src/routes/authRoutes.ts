import { Router } from "express";
import { login, me } from "../controllers/authController";
import { authenticateAdmin } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { loginSchema } from "../validators/authValidators";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.get("/me", authenticateAdmin, me);

export default router;