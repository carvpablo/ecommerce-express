import { prisma } from "../db.js";
import { Request, Response } from "express";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json({ products });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching data" });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, stock } = req.body;

    if (!name || !price || !description || !stock) {
      return res.status(400).json({ error: "Insert valid data" });
    }

    const addProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
        stock,
      },
    });
    return res
      .status(201)
      .json({ success: "Product created", data: addProduct });
  } catch (err) {
    return res.status(500).json({ error: "Error creating product" });
  }
};

interface updateBodyProduct {
  name: string;
  price: number;
  description: string;
  stock: number;
}

export const updateProduct = async (
  req: Request<{ id: string }, {}, updateBodyProduct>,
  res: Response,
) => {
  try {
    const { name, price, description, stock } = req.body;
    const id = req.params.id;

    const update = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        price,
        description,
        stock,
      },
    });
    return res.status(200).json({ success: "Product updated", data: update });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid Id" });
    }
    const deleteProduct = await prisma.product.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({ success: "Product deleted successfully" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product id not found" });
    }
    return res.status(500).json({ error: "Failed to delete product" });
  }
};
