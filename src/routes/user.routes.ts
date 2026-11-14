import { Response, Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { checkAdmin, requireSignin } from "../middlewares/user.js";


const router = Router();

const controller = new UserController();

router.get("/", controller.findAll);

router.post("/signin", controller.signin);

router.post("/signup", controller.signup);

router.get("/admin", requireSignin, checkAdmin, (req: any, res: Response) => {
    res.status(200).json({ message: "es admin" })
})

export default router;