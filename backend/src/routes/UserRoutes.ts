import { Router } from "express";
import * as UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", UserController.createUser);
router.post("/login", UserController.loginUser);
router.get("/", authMiddleware, UserController.getAllUsers);
router.get("/:id", authMiddleware, UserController.getUserById);
router.put("/:id", authMiddleware, UserController.updateUser);
router.delete("/:id", authMiddleware, UserController.destroyUserById);

export default router;
