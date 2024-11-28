// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const verifyPermission = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // console.log(req.cookies)
  const token =
    req.cookies.access_token || req.headers["authorization"]?.split(" ")[1]; // Get token from cookies or headers
  if (!token) {
    return next(res.status(403).json({ message: "No token provided." }));
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    async (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) return res.status(401).json({ message: "Unauthorized.sdf" });

      req.userId = decoded._id; // Attach user ID to the request for use in routes
      const user = await User.findById(decoded._id);
      if (!user) return res.sendStatus(400);
      req.role = user.role;
      next();
    }
  );
};
