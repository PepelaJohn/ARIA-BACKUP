import express, { Request, Response } from "express";
import ServiceOrder from "../models/ServiceOrder";
import User from "../models/User";
import { getRecipientSocketId, io } from "../sockets/socket";
import mongoose from "mongoose";
import Rating from "../models/Ratings";
import { generateUniqueCodeWithTimestamp } from "../utils/index";
import ServiceProvider from "../models/ServiceProvider";
import CorporateQuoteRequest from "../models/CorporateRequest";
const router = express.Router();

interface ServiceOrderRequestBody extends Request {
  body: {
    serviceType: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle"; // Type of service (cab, drone, truck, or plane)
    location: { lat: number; long: number; name: string }; // Pickup location
    destination: { lat: number; long: number; name: string }; // Drop-off location
    price: number;
  };
}

// Controller to place a new service order
export const placeServiceOrder = async (
  req: ServiceOrderRequestBody,
  res: Response
): Promise<Response> => {
  const { serviceType, location, destination } = req.body;
  const userId = req?.userId;

  if (!userId) return res.status(403).json("No permission");

  // Validate request body
  if (!serviceType || !location || !destination) {
    return res.status(400).json({
      message: "Service type, location, and destination are required.",
    });
  }

  try {
    // Create a new service order
    const trackingId = generateUniqueCodeWithTimestamp();
    const newOrder = new ServiceOrder({
      trackingId,
      consumerId: req.userId, // Make sure `userId` is set in middleware
      serviceType,
      location,
      destination,
      status: "pending", // Optional: Set the initial status
      price: req.body.price,
    });

    await newOrder.save();

    // Notify all connected service providers of the new order\

    io.to(serviceType).emit("newOrder", {
      orderId: newOrder._id,
      pickup: location,
      destination,
      price: newOrder.price,
    });

    const user = await User.findById(userId);
    if (!user) return res.status(400).json("User Not Found!");

    user.orders.push(newOrder._id as mongoose.Schema.Types.ObjectId);
    await user.save();

    // //console.log(req.body);

    return res
      .status(201)
      .json({ message: "Service order placed successfully.", order: newOrder });
  } catch (error) {
    console.error("Error placing service order:", error);
    return res
      .status(500)
      .json({ message: "Server error while placing order." });
  }
};

export const cancelServiceOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId } = req.params;

  try {
    // Find the order and ensure it belongs to the user and is still cancellable
    //console.log(orderId);
    const order = await ServiceOrder.findOne({
      _id: orderId,
      status: "pending",
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or cannot be canceled" });
    }

    // Update the order status to 'canceled'
    order.status = "cancelled";
    await order.save();

    if (!!order.serviceProviderId) {
      io.to(
        getRecipientSocketId(order.serviceProviderId) as unknown as
          | string
          | string[]
      ).emit("orderCanceled", order);
    } else {
      io.emit("orderCanceled", order);
    }
    //console.log("ajkdlf");

    return res
      .status(200)
      .json({ message: "Order canceled successfully.", order });
  } catch (error) {
    console.error("Error canceling service order:", error);
    return res
      .status(500)
      .json({ message: "Server error while canceling order." });
  }
};

// Controller to start the journey
export const startJourney = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId } = req.params;

  try {
    const { time } = req.body;

    if (!time || !orderId)
      return res.status(400).json({ message: "Bad Request" });
    // Find the order, ensure it exists, and is in 'accepted' status
    const order = await ServiceOrder.findOneAndUpdate(
      { _id: orderId, status: "accepted" },
      { status: "in-progress", timeStarted: time },
      { new: true }
    );

    if (!order) {
      return res
        .status(400)
        .json({ message: "Order not found or already started." });
    }
    //console.log(order.serviceProviderId, req.userId);
    if (order.serviceProviderId?.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perfom this.", order });
    }

    // Emit an event to the consumer to notify that the journey has started

    io.to(getRecipientSocketId(order.consumerId.toString())).emit(
      "journeyStarted",
      order
    );
    //console.log(getRecipientSocketId(order.consumerId.toString()));

    return res
      .status(200)
      .json({ message: "Journey started successfully.", order });
  } catch (error) {
    console.error("Error starting journey:", error);
    return res
      .status(500)
      .json({ message: "Server error while starting journey." });
  }
};

// Controller to finish the journey
export const finishJourney = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId } = req.params;

  try {
    const { time } = req.body;

    if (!time || !orderId)
      return res.status(400).json({ message: "Bad Request" });

    const order = await ServiceOrder.findOneAndUpdate(
      { _id: orderId, status: "in-progress" },
      { status: "completed", timeFinished: time },
      { new: true }
    );

    
    if (!order || order.serviceProviderId?.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perfom this." });
    }

    if (!order) {
      return res
        .status(400)
        .json({ message: "Order not found or already completed." });
    }

    // const user = await User.findById(order.serviceProviderId);
    const serviceProviderProfile = await ServiceProvider.findOne({
      userId: order.serviceProviderId,
    });
    //console.log(serviceProviderProfile);
    if (!!serviceProviderProfile) {
      serviceProviderProfile.services.push(
        order._id as mongoose.Types.ObjectId
      );
      await serviceProviderProfile.save();
    }

    // Emit an event to the consumer to notify that the journey has finished
    io.to(getRecipientSocketId(order.consumerId.toString())).emit(
      "journeyCompleted",
      {
        ...order,
      }
    );

    return res.status(200).json({ message: "Journey completed successfully." });
  } catch (error) {
    console.error("Error finishing journey:", error);
    return res
      .status(500)
      .json({ message: "Server error while finishing journey." });
  }
};

// Controller to submit a rating for a service order
export const rateService = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId } = req.params;
  const { rating, review } = req.body;
  const consumerId = req.userId; // Assumes `userId` is set in middleware

  // Validate the rating input
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    //console.log(orderId, consumerId);
    // Find the service order and ensure it has been completed
    const order = await ServiceOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Service order not found." });
    }

    if (order.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Order must be completed before rating." });
    }

    // Check if the consumer placing the rating matches the order consumer
    if (order.consumerId.toString() !== consumerId) {
      return res
        .status(403)
        .json({ message: "You can only rate your own orders." });
    }

    // Create a new rating or update if rating already exists for the order
    const ratingDoc = await Rating.findOneAndUpdate(
      { orderId: order._id },
      {
        consumerId,
        serviceProviderId: order.serviceProviderId,
        rating,
        review,
      },
      { new: true, upsert: true } // Create new if not existing
    );

    // Optionally update the provider's rating in the User model
    const serviceProviderProfile = await ServiceProvider.findOne({
      userId: order.serviceProviderId,
    });
    if (serviceProviderProfile) {
      const ratings = await Rating.find({
        serviceProviderId: serviceProviderProfile.userId,
      });
      const averageRating =
        ratings.reduce((sum, rate) => sum + rate.rating, 0) / ratings.length;
      serviceProviderProfile.averageRating = averageRating; // Requires averageRating field in User schema
      serviceProviderProfile.ratings.push(
        ratingDoc._id as mongoose.Types.ObjectId
      );
      await serviceProviderProfile.save();
    }

    return res.status(200).json({ message: "Rating submitted successfully." });
  } catch (error) {
    console.error("Error rating service:", error);
    return res
      .status(500)
      .json({ message: "Server error while rating service." });
  }
};

// Get all service orders
export const getAllServiceOrders = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "Bad Request" });
  //console.log(req.role, "live");

  let populator: "serviceProviderId" | "consumerId" = "serviceProviderId";
  if (req.role === "service-provider") {
    populator = "consumerId";
  }
  try {
    //console.log(userId);
    const serviceOrders = await ServiceOrder.find(
      {
        $or: [{ serviceProviderId: userId }, { consumerId: userId }],
      },
      { location: 0, destination: 0 }
    )
      .populate(populator, "name email _id ")
      .limit(10);

    let arr: any[] = serviceOrders;

    if (
      serviceOrders.length <= 10 &&
      (req.role === "corporate" || req.role === "corporate")
    ) {
      const corporateOrders = await CorporateQuoteRequest.find(
        {
          $or: [{ serviceProviderId: userId }, { userId }],
        },
        { pickup: 0, dropOff: 0 }
      )
        .populate("serviceProviderId", "name email _id ")
        .limit(10);

      arr = [...arr, ...corporateOrders];
      //console.log(corporateOrders);
    }

    res.status(200).json(arr);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service orders" });
  }
};

// Create a new service order
export const createServiceOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = await ServiceOrder.create(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to create service order", details: error });
  }
};

// Get a single service order by ID
export const getServiceOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  //console.log(id);
  try {
    const serviceOrder = await ServiceOrder.findById(id);
    if (!serviceOrder) {
      return res.status(404).json({ error: "Service order not found" });
    }
    res.status(200).json(serviceOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service order" });
  }
};

// Update service order status
export const updateServiceOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const serviceOrder = await ServiceOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!serviceOrder) {
      return res.status(404).json({ error: "Service order not found" });
    }
    res.status(200).json(serviceOrder);
  } catch (error) {
    res.status(400).json({ error: "Failed to update service order status" });
  }
};

// Delete a service order
export const deleteServiceOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedOrder = await ServiceOrder.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Service order not found" });
    }
    res.status(200).json({ message: "Service order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service order" });
  }
};

export default router;
