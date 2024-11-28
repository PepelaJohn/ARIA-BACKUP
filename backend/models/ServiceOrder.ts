import mongoose, { Schema, model, Document } from "mongoose";
//import User from './User';
interface ServiceOrderDocument extends Document {
  consumerId: mongoose.Schema.Types.ObjectId; // ID of the consumer placing the order
  serviceType: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    name: string;
  };
  price: number;
  status: "pending" | "accepted" | "completed" | "cancelled" | "in-progress";
  serviceProviderId?: string; // ID of the assigned service provider
  trackingId: string;
  timeStarted?: string;
  timeFinished?: string;
}

const serviceOrderSchema = new Schema<ServiceOrderDocument>(
  {
    timeStarted: {
      type: String,
    },
    timeFinished: {
      type: String,
    },
    trackingId: { type: String, required: true, index: true },
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["Rider", "Cab", "Jet", "Drone", "Truck", "Shuttle"],
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
      name: { type: String },
    },
    destination: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
      name: { type: String },
    },
    price: Number,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "in-progress"],
      default: "pending",
    },
    serviceProviderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ServiceOrder = model<ServiceOrderDocument>(
  "ServiceOrder",
  serviceOrderSchema
);
export default ServiceOrder;
