import express from "express";
import { getUserById, updateUser, deleteUser, } from "../controllers/userController.js";
const router = express.Router();
router.get("/:id", getUserById);
router.put("/", updateUser);
router.delete("/:id", deleteUser);
export default router;
