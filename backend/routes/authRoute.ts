import { Request, Response } from "express";
import { authUser, verifyUser } from "../controllers/auth";
import { verifyToken } from "../middleware/auth";

const express = require("express");
const router = express.Router();

router.post("/user/verify", verifyUser);
router.post("/user/:page/:role", authUser);

router.post("/admin/login", (req: Request, res: Response) => {
  // Admin authentication logic here
  console.log("kere");
});

export default router;
