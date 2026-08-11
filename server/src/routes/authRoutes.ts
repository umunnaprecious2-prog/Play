import { Router } from "express";
import { login, logout, me } from "../controllers/authController";
import { authenticateAdmin } from "../middlewares/auth";
import { authLimiter } from "../middlewares/rateLimit";
import { validateBody } from "../middlewares/validate";
import { loginSchema } from "../validators/authValidators";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Admin login and session
 */
const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in as an admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       401:
 *         description: Invalid admin credentials
 */
router.post("/login", authLimiter, validateBody(loginSchema), login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current admin user and session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminMeResponse'
 *       401:
 *         description: Missing or invalid/expired admin token
 */
router.get("/me", authenticateAdmin, me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the current admin session server-side
 *     description: Deletes this session's token from the database so it can no longer be used, even before it naturally expires.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", authenticateAdmin, logout);

export default router;
