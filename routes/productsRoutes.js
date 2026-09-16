import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/get", getProducts);

router.post("/add", addProduct);

router.patch("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;
