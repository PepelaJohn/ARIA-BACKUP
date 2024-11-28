import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
const dotenv = require('dotenv')
dotenv.config()

export const verifyTokenSocket = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;
  
  if (!token) return next(new Error("Authentication error"));

  try {
    
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    (socket as any).user = decoded; // Attach user info to socket object
    // console.log('User verified', decoded)
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    next(new Error("Authentication error"));
  }
};
