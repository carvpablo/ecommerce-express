import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getProducts);

router.post("/", addProduct);

router.patch("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;
