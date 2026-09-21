import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { generateToken } from "../util/generateToken.js";
export const signIn = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                cart: {
                    create: {},
                },
            },
            include: {
                cart: true,
            },
        });
        return res.status(201).json({ message: "User created successfully" });
    }
    catch (err) {
        return res.status(500).json({ error: "Error creating user" });
    }
};
export const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const compareHash = await bcrypt.compare(password, user.password);
        if (!compareHash) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        generateToken(user, res);
        return res.status(200).json({ message: "User logged successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error logging in" });
    }
};
export const logOut = async (req, res) => {
    try {
        res.clearCookie("jwtToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return res.status(200).json({ message: "Logout successful" });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to log out" });
    }
};
