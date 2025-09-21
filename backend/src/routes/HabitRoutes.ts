import { Router } from "express";
import {
  createHabit,
  listUserHabits,
  updateHabit,
  deleteHabit,
  createHabitRecord,
  listHabitRecords,
  deleteHabitRecordByDate,
} from "../controllers/HabitController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createHabit);
router.get("/", authMiddleware, listUserHabits);
router.put("/:id", authMiddleware, updateHabit);
router.delete("/:id", authMiddleware, deleteHabit);

router.post("/:habitId/records", authMiddleware, createHabitRecord);
router.get("/:habitId/records", authMiddleware, listHabitRecords);
router.delete("/:habitId/records", authMiddleware, deleteHabitRecordByDate);

export default router;
