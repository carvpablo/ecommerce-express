import jwt from "jsonwebtoken";
import "dotenv/config";
export function generateToken(user, res) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is missing!");
    }
    const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: "7d",
    });
    res.cookie("jwtToken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return token;
}
