import express from "express";
import {
  getCart,
  addToCart,
  deleteFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", getCart);

router.post("/", addToCart);

router.delete("/:id", deleteFromCart);

export default router;
