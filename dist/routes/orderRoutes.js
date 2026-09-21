import express from "express";
import { createOrder, deleteOrder } from "../controllers/orderController.js";
const router = express.Router();
router.post("/", createOrder);
router.delete("/:id", deleteOrder);
export default router;
