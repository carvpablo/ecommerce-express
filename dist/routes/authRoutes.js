import express from "express";
import { signIn, logIn, logOut } from "../controllers/authController.js";
const router = express.Router();
router.post("/signin", signIn);
router.post("/login", logIn);
router.post("/logout", logOut);
export default router;
