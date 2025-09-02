import { Router } from "express";
import {
  createHabit,
  listUserHabits,
  updateHabit,
  deleteHabit,
  createHabitRecord,
  listHabitRecords,
} from "../controllers/HabitController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createHabit);
router.get("/user/:userId", authMiddleware, listUserHabits);
router.put("/:id", authMiddleware, updateHabit);
router.delete("/:id", authMiddleware, deleteHabit);

router.post("/:habitId/records", authMiddleware, createHabitRecord);
router.get("/:habitId/records", authMiddleware, listHabitRecords);

export default router;
