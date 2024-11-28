import mongoose, { Schema, Document, Model } from "mongoose";
import User from "./User"; // Import the User model

interface IServiceProviderProfile extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user
  services: mongoose.Types.ObjectId[]; // References to the services offered
  providerType: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
  vehicleRegistrationNumber?: string;
  averageRating: number;
  preferredPayment?: string;

  ratings: mongoose.Types.ObjectId[]; // References to ratings
}

const ServiceProviderProfile: Schema<IServiceProviderProfile> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One service provider profile per user
    },
    preferredPayment: { type: String, default: "Cash" },
    services: {
      type: [Schema.Types.ObjectId],
      ref: "Service",
      default: [],
    },
    providerType: {
      type: String,
      enum: ["Rider", "Cab", "Jet", "Drone", "Truck", "Shuttle"],
      required: true,
    },
    vehicleRegistrationNumber: {
      type: String,
      required: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratings: {
      type: [Schema.Types.ObjectId],
      ref: "Rating",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ServiceProviderProfile.pre<IServiceProviderProfile>("save", async function (next) {
  
  try {
    if (this.vehicleRegistrationNumber) {
      await User.findByIdAndUpdate(this.userId, { isVerified: true });
    } else {
      await User.findByIdAndUpdate(this.userId, { isVerified: false });
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

const ServiceProvider: Model<IServiceProviderProfile> =
  mongoose.model<IServiceProviderProfile>("ServiceProvider", ServiceProviderProfile);

export default ServiceProvider;
