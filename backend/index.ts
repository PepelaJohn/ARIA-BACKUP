import corsOptions from "./config/corsOptions";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute";
import corporateRoute from "./routes/corporateRoutes";
import connectDBANDSERVER from "./utils/connectDB";
import serviceOrderRoute from "./routes/serviceOrder";
import express, { NextFunction, Request, Response } from "express";

import { app, server } from "./sockets/socket";
import refreshRoute from "./routes/refreshRoute";
import ratingRoute from "./routes/rating";
const dotenv = require("dotenv");


dotenv.config();

const CONNECTION_URL = process.env.MONGO_URI;
const PORT = process.env.PORT as unknown as number;
app.use(express.json({ limit: "20mb" }));

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

connectDBANDSERVER(CONNECTION_URL!, PORT!, server);

app.use((req: Request, _: Response, next: NextFunction) => {
  console.log(req.url, "index");
  next();
});

app.get("/", (req: any, res: any) => {
  return res.json("Welcome to Aria");
});

app.use("/api/ratings", ratingRoute);
app.use("/api/corporate", corporateRoute);
app.use("/api/refresh", refreshRoute);
app.use("/api/auth", authRoute);
app.use("/api", serviceOrderRoute);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Not found");
  next();
});
