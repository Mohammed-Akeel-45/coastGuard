import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/regitser", authController.register);
router.post("/revoke", authController.logout);
router.post("/refresh", authController.refreshToken);

export default router;
