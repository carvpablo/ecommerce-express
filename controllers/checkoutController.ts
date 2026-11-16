import Stripe from "stripe";
import { Request, Response } from "express";
import { prisma } from "../db.js";
import { createOrderForUser } from "../util/createOrder.js";

export const createCheckOut = async (req: Request, res: Response) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is missing!");
  }

  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const stripe = new Stripe(stripeSecretKey);
  try {
    const data = await prisma.cart.findUnique({
      where: {
        userId: req.user?.id,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!data || data.products.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: data.products.map((item) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.product.name,
          },
          unit_amount: item.product.price,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "https://ecommerce-react-eosin-eight.vercel.app/orders",
      integration_identifier: "hosted_web_0001",
      metadata: { userId: req.user.id },
    });

    if (!session.url) {
      return res
        .status(502)
        .json({ error: "Failed to create checkout session" });
    }

    res.status(200).json({ url: session.url });
  } catch {
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};

export const webHookEndpoint = async (req: Request, res: Response) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecretKey = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is missing!");
  }

  if (!webhookSecretKey) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is missing!");
  }

  const stripe = new Stripe(stripeSecretKey);

  let notification;
  // Get the signature sent by Stripe
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }
  try {
    // Verify the signature and parse the thin event notification
    notification = stripe.parseEventNotification(
      req.body,
      signature,
      webhookSecretKey,
    );
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }
  try {
    // Handle the event notification by matching its type property.
    // The notification identifies the related object, but doesn't contain it.
    // Matching on type also identifies events that are represented by
    // UnknownEventNotification because this SDK version doesn't include their class.
    switch (notification.type) {
      case "v1.checkout.session.completed": {
        // Fetch the current version of the related object
        const sessionCompleted = await notification.fetchRelatedObject();
        const userId = sessionCompleted.metadata?.userId;

        if (!userId) {
          return res.status(400).json({ error: "Missing userId in metadata" });
        }

        await createOrderForUser(userId);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        // Optional: set FETCH_FULL_EVENT=true to retrieve the full event when you
        // need data that the notification and related object don't provide.
        if (process.env.FETCH_FULL_EVENT === "true") {
          const event = await notification.fetchEvent();
          console.log(`Retrieved event ${event.id}.`);
        }
        break;
      }
      case "v1.payment_method.attached": {
        const paymentMethod = await notification.fetchRelatedObject();
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      }
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${notification.type}.`);
    }
  } catch (err: any) {
    console.log(`Webhook handler failed.`, err.message);
    return res.sendStatus(500);
  }
  // Return a 200 response to acknowledge receipt of the event
  res.send();
};
