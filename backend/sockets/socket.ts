import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { verifyTokenSocket } from "../middleware/authsocket";
import corsOptions from "../config/corsOptions";

const app = express();
const server = http.createServer(app);
const apiNamespace = new Server(server, {
  cors: {
    origin: "https://aria-front-psi.vercel.app/",
    methods: ["GET", "POST"],
  },
});
const io = apiNamespace.of('/api');

app.use(express.json());
interface providerDtype {
  lat: number;
  lng: number;
  userId: string;
  providerType: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | 'Shuttle';
  socketid: string;
}
// Use token verification middleware for socket connections
io.use(verifyTokenSocket);

const onlineProvidersMap: Record<string, providerDtype> = {};

const userSocketMap: Record<string, string> = {}; // userId: socketId

export const getRecipientSocketId = (id: string | string[]) => {
  if (Array.isArray(id)) {
    const usersMap: string[] = [];
    for (const user of id) {
      if (userSocketMap[user]) {
        usersMap.push(userSocketMap[user]);
      }
    }
    return usersMap;
  }
  return userSocketMap[id];
};

io.on("connection", (socket) => {
  // console.log("A user connected:", socket.id);
  const userId = socket.handshake.query._id as string | undefined;
  if (!!userId) userSocketMap[userId] = socket.id;
  // console.log(userSocketMap)
  socket.on(
    "providerLocationUpdate",
    (data: { lat: number; lng: number; consumerId: string }) => {
      console.log(data, "providerLocationUpdate");
      io.to(
        getRecipientSocketId(data.consumerId) as unknown as string | string[]
      ).emit("providerLocationUpdate", data);
    }
  );

  

  socket.on(
    "online",
    (data: { providerType:"Rider" | "Cab" | "Jet" | "Drone" | "Truck" | 'Shuttle' }) => {
      socket.join(data.providerType);
      console.log("User joined " + data.providerType);
    }
  );

  socket.on("providerLocation", (data: providerDtype) => {
    if (!!userId) onlineProvidersMap[userId] = { ...data, socketid: socket.id };
    // console.log(onlineProvidersMap);

    // console.log("providerLocation emitting");
    io.emit("providerLocation", Object.values(onlineProvidersMap));
  });

 

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      delete onlineProvidersMap[userId];
      io.emit("providerLocation", Object.values(onlineProvidersMap));
    }
  });
});

export { io, server, app };
