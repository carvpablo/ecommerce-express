import { prisma } from "../db.js";

export class OrderError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Cria um pedido a partir do carrinho do usuário, decrementa o estoque e limpa o carrinho.
 */
export async function createOrderForUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
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
      throw new OrderError("Your cart is empty", 400);
    }

    for (const item of cart.products) {
      if (item.product.stock < item.quantity) {
        throw new OrderError(
          `Insufficient stock for product "${item.product.name}". Available: ${item.product.stock}, requested: ${item.quantity}`,
          400,
        );
      }
    }

    const total = cart.products.reduce((acc, curr) => {
      return acc + curr.product.price * curr.quantity;
    }, 0);

    const order = await tx.order.create({
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

    await Promise.all(
      cart.products.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity, // Subtrai a quantidade comprada
            },
          },
        }),
      ),
    );

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });
}
