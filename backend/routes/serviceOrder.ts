import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import {
  cancelServiceOrder,
  finishJourney,
  getAllServiceOrders,
  getServiceOrderById,
  placeServiceOrder,
  rateService,
  startJourney,
} from "../controllers/service";
import { verifyToken } from "../middleware/auth";
import { acceptJob } from "../controllers/acceptJOb";
import { verifyPermission } from "../middleware/verifypermission";
const express = require("express");
const router = express.Router();

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message:
    "Too many orders created from this IP, please try again after 15 minutes",
});

// Place a new service order
router.get(
  "/service-orders",
  orderLimiter,
  verifyToken,
  verifyPermission,
  getAllServiceOrders
);
router.get(
  "/service-orders/:id",
  orderLimiter,
  verifyToken,
  verifyPermission,
  getServiceOrderById
);
router.post("/service/order", verifyToken, orderLimiter, placeServiceOrder);
router.post("/service/order/:orderId", orderLimiter, verifyToken, acceptJob);
router.put(
  "/service/cancel/:orderId",
  orderLimiter,
  verifyToken,
  cancelServiceOrder
);
router.post("/service/start/:orderId", verifyToken, startJourney);
router.post("/service/finish/:orderId", verifyToken, finishJourney);
router.post("/service/rate/:orderId", verifyToken, rateService);
export default router;
