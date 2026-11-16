import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import checkOutRouter from "./routes/checkoutRoutes.js";
import { webHookEndpoint } from "./controllers/checkoutController.js";

import { validateToken } from "./middlewares/validateToken.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/webhook", express.raw({ type: "application/json" }), webHookEndpoint);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/cart", validateToken, cartRouter);
app.use("/products", productsRouter);
app.use("/users", validateToken, userRouter);
app.use("/orders", validateToken, orderRouter);
app.use("/checkout", validateToken, checkOutRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
