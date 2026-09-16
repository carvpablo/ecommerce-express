import { prisma } from "../db.js";

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json({ products });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching data" });
  }
};

export const addProduct = async (req, res) => {
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

export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    const update = await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: {
        name,
        price,
        description,
        stock,
      },
    });
    return res.status(200).json({ success: "Product updated", data: update });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleteProduct = await prisma.product.delete({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json({ success: "Product deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product id not found" });
    }
    return res.status(500).json({ error: "Failed to delete product" });
  }
};
