import { prisma } from "../db.js";
import { Request, Response } from "express";
import { createOrderForUser, OrderError } from "../util/createOrder.js";

export const getOrders = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true, // Traz detalhes de cada produto comprado
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Mostra os pedidos mais recentes primeiro
      },
    });
    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const data = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({ order: data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const order = await createOrderForUser(userId);

    return res
      .status(201)
      .json({ message: "Order created successfully", order });
  } catch (err) {
    if (err instanceof OrderError) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to create order" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params?.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const userId = req.user?.id;

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this order" });
    }

    await Promise.all(
      order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity, // Soma as unidades de volta ao estoque
            },
          },
        }),
      ),
    );

    const deleteOrder = await prisma.order.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete order" });
  }
};
