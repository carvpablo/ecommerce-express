import express from "express";
import { createCheckOut } from "../controllers/checkoutController.js";

const router = express.Router();

router.post("/", createCheckOut);

export default router;
