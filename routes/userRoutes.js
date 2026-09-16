import express from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/get", getUserById);

router.put("/update", updateUser);

router.delete("/delete", deleteUser);

export default router;
