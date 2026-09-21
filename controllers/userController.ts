import { prisma } from "../db.js";
import { Request, Response } from "express";

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching user" });
  }
};

interface updateUserBody {
  name: string;
  email: string;
}

export const updateUser = async (
  req: Request<{}, {}, updateUserBody>,
  res: Response,
) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        name,
        email,
      },
    });

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Error updating user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(500).json({ message: "User  deleted successfully" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Error deleting user" });
  }
};
