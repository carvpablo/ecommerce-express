import { prisma } from "../db.js";
export const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const cart = await prisma.cart.findUnique({
            where: {
                userId,
            },
            include: {
                products: {
                    include: { product: true },
                },
            },
        });
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ error: "Your cart is empty" });
        }
        for (const item of cart.products) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for product "${item.product.name}". Available: ${item.product.stock}, requested: ${item.quantity}`,
                });
            }
        }
        const total = cart.products.reduce((acc, curr) => {
            return acc + curr.product.price * curr.quantity;
        }, 0);
        const order = await prisma.order.create({
            data: {
                total,
                userId,
                items: {
                    create: cart.products.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                },
            },
            include: {
                items: true,
            },
        });
        await Promise.all(cart.products.map((item) => prisma.product.update({
            where: { id: item.productId },
            data: {
                stock: {
                    decrement: item.quantity, // Subtrai a quantidade comprada
                },
            },
        })));
        const emptyCart = await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });
        return res
            .status(201)
            .json({ message: "Order created successfully", order });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create order" });
    }
};
export const deleteOrder = async (req, res) => {
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
        await Promise.all(order.items.map((item) => prisma.product.update({
            where: { id: item.productId },
            data: {
                stock: {
                    increment: item.quantity, // Soma as unidades de volta ao estoque
                },
            },
        })));
        const deleteOrder = await prisma.order.delete({
            where: {
                id,
            },
        });
        return res.status(200).json({ message: "Order deleted successfully" });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to delete order" });
    }
};
