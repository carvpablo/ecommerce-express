import { prisma } from "../db.js";

export const getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: {
        userId: req.body.userId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    return res.status(200).json({ cart });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching data" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { cartId, productId, quantity = 1 } = req.body;

    const itemQuantity = Number(quantity);

    const addProductToCart = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: itemQuantity,
        },
      },
      create: {
        cartId,
        productId,
        quantity: itemQuantity,
      },
      include: {
        product: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Cart updated successfully", data: addProductToCart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error updating cart" });
  }
};

export const deleteFromCart = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deleteItemFromCart = await prisma.cartItem.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Item deleted from cart" });
  } catch (err) {
    return res.status(500).json({ error: "Error deleting item from cart" });
  }
};
