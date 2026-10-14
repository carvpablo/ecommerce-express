import express from "express";
import {
  getCart,
  addToCart,
  deleteFromCart,
  updateCartItemQuantity,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", getCart);

router.post("/", addToCart);

router.patch("/:id", updateCartItemQuantity);

router.delete("/:id", deleteFromCart);

export default router;
