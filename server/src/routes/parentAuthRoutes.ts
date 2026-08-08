import { Router } from "express";
import { addChild, claimChild, login, me, signup } from "../controllers/parentAuthController";
import { authenticateParent } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { addChildSchema, claimChildSchema, parentLoginSchema, parentSignupSchema } from "../validators/parentAuthValidators";

/**
 * @swagger
 * tags:
 *   - name: Parents
 *     description: Parent (family) accounts and child profiles
 */
const router = Router();

/**
 * @swagger
 * /parents/signup:
 *   post:
 *     tags: [Parents]
 *     summary: Create a new parent account
 *     description: If claimPlayerId is provided, that existing guest player profile is linked onto the new account (best-effort -- signup still succeeds even if the claim fails).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParentSignupRequest'
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentAuthResponse'
 *       409:
 *         description: An account with this email already exists
 */
router.post("/signup", validateBody(parentSignupSchema), signup);

/**
 * @swagger
 * /parents/login:
 *   post:
 *     tags: [Parents]
 *     summary: Log in to a parent account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParentLoginRequest'
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentAuthResponse'
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", validateBody(parentLoginSchema), login);

/**
 * @swagger
 * /parents/me:
 *   get:
 *     tags: [Parents]
 *     summary: Get the current parent account and their child profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parent account and children
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentMeResponse'
 *       401:
 *         description: Missing or invalid/expired session token
 */
router.get("/me", authenticateParent, me);

/**
 * @swagger
 * /parents/children:
 *   post:
 *     tags: [Parents]
 *     summary: Create a new child profile under the authenticated parent account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddChildRequest'
 *     responses:
 *       201:
 *         description: Child profile created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChildProfile'
 *       409:
 *         description: That nickname is already taken
 */
router.post("/children", authenticateParent, validateBody(addChildSchema), addChild);

/**
 * @swagger
 * /parents/children/claim:
 *   post:
 *     tags: [Parents]
 *     summary: Link an existing guest player profile onto the authenticated parent account
 *     description: Preserves the guest profile's existing XP/streaks/progress. Idempotent if the same parent claims twice; rejected if another account already claimed it.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaimChildRequest'
 *     responses:
 *       200:
 *         description: Player profile linked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChildProfile'
 *       404:
 *         description: Player profile not found
 *       409:
 *         description: This player is already linked to another account
 */
router.post("/children/claim", authenticateParent, validateBody(claimChildSchema), claimChild);

export default router;
