import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;
  let token;

  if (req.cookies?.jwtToken) {
    token = req.cookies.jwtToken;
  } else if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is missing!");
    }
    const decoded = jwt.verify(token, secret) as any;

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(500).json({ error: "Invalid or expired token" });
  }
};
