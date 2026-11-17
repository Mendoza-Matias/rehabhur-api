import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { schemaValidator } from "../middlewares/validate.js";
import { UserRepository } from "../repository/users.repository.js";
import { createUserSchema } from "../schemas/auth.schema.js";
import { UserService } from "../services/user.service.js";

const repository = new UserRepository();
const service = new UserService(repository);
const controller = new UserController(service);
const router = Router();

const adminOnly = [requireAuth(service), requireRole("admin")];

router.get("/", adminOnly, controller.findAll);
router.post("/", adminOnly, schemaValidator(createUserSchema), controller.create);

export default router;
