import { Router } from "express";
import { addChild, claimChild, login, me, signup } from "../controllers/parentAuthController";
import { authenticateParent } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { addChildSchema, claimChildSchema, parentLoginSchema, parentSignupSchema } from "../validators/parentAuthValidators";

const router = Router();

router.post("/signup", validateBody(parentSignupSchema), signup);
router.post("/login", validateBody(parentLoginSchema), login);
router.get("/me", authenticateParent, me);
router.post("/children", authenticateParent, validateBody(addChildSchema), addChild);
router.post("/children/claim", authenticateParent, validateBody(claimChildSchema), claimChild);

export default router;
