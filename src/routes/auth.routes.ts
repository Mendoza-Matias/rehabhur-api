import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { schemaValidator } from "../middlewares/validate.js";
import { UserRepository } from "../repository/users.repository.js";
import {
    refreshTokenSchema,
    signinSchema,
    signupSchema,
} from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";

const repository = new UserRepository();
const userService = new UserService(repository);
const authService = new AuthService(userService);
const controller = new AuthController(authService);
const router = Router();

router.post("/signup", schemaValidator(signupSchema), controller.signup);
router.post("/signin", schemaValidator(signinSchema), controller.signin);
router.post("/refresh-token", schemaValidator(refreshTokenSchema), controller.refreshToken);
router.post("/logout", schemaValidator(refreshTokenSchema), controller.logout);
router.get("/profile", requireAuth(userService), controller.profile);

export default router;
