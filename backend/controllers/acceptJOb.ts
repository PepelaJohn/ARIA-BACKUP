import { Request, Response } from "express";
import ServiceOrder from "../models/ServiceOrder";
import { getRecipientSocketId, io } from "../sockets/socket";

export const acceptJob = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId } = req.params;
  const serviceProviderId = req.userId; // from verify token

  try {
    const order = await ServiceOrder.findOne({ _id: orderId });

    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    // Check if the order is still pending before accepting
    if (order.status !== "pending" || !!order.serviceProviderId) {
      return res.status(400).json({
        message: "Order has already been accepted or is not available",
      });
    }

    // If the order is pending, update it to 'accepted' and assign the provider
    order.status = "accepted";
    order.serviceProviderId = serviceProviderId;
    await order.save();
    io.to(
      getRecipientSocketId(order.consumerId) as unknown as string | string[]
    ).emit("orderAccepted", order);

    return res
      .status(200)
      .json({ message: "Order accepted successfully", order });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while accepting order" });
  }
};
