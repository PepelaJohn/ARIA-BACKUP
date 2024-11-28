import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import express, { Request, Response } from "express";
import mongoose from "mongoose";

const router = express.Router();

interface DecodedToken extends JwtPayload {
  username: string;
  _id: string;
  name: string;
}

export async function refreshToken(
  req: Request,
  res: Response
): Promise<Response | void> {
  const refresh_token = req?.cookies?.refresh_token as string;
  const userId = req.params.id;

  if (!refresh_token) return res.status(400).json("Invalid request");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)  ) {
    return res.status(403).json({ message: "No permissions to access this" });
  }

  try {
    const validUser = await User.findOne({ _id: userId });
    if (!validUser || !validUser.refreshToken) {
      return res.status(403).json({ message: "Please login again" });
    }

    const validToken =
      validUser.refreshToken.toString() === refresh_token?.toString();
    if (!validToken || !refresh_token) {
      return res.status(403).json({ message: "No permission" });
    }

    jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET as string,
      (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "You do not have the rights to access this" });
        }

        const { username, _id,  } = decoded as DecodedToken;
        const access_token = jwt.sign(
          { _id, username, name: validUser.name },
          process.env.ACCESS_TOKEN_SECRET as string
        );

        return res
          .cookie("access_token", access_token, {
            httpOnly: false,
            maxAge: 60 * 1000, // 1 minute 
            sameSite: "none",
            secure: true,
            priority: "high",
          })
          .sendStatus(204);
      }
    );
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export default router;
