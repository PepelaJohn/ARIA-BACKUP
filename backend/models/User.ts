import mongoose, { Document, Schema, Model } from "mongoose";
import ServiceProvider from "./ServiceProvider";

interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  refreshToken?: string;
  img?: string;
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  role: "consumer" | "admin" | "service-provider" | "corporate";
  corporateProfile?: mongoose.Types.ObjectId; // Reference to CorporateProfile
  serviceProviderProfile?: mongoose.Types.ObjectId; // Reference to ServiceProviderProfile
  orders: mongoose.Schema.Types.ObjectId[];
  phoneNumber?: string;
  emailVerificationLink?: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    emailVerificationLink: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: "" },
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: (v: string) => /^\+?\d{0,15}$/.test(v),
        message: "Phone number must be valid",
      },
    },
    img: { type: String, default: "" },
    isFrozen: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["consumer", "admin", "service-provider", "corporate"],
      default: "consumer",
    },
    corporateProfile: {
      type: Schema.Types.ObjectId,
      ref: "CorporateProfile",
      default: null, // Null for non-corporate users
    },
    serviceProviderProfile: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProviderProfile",
      default: null, // Null for non-service providers
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to manage isVerified for service providers
UserSchema.pre<IUser>("save", async function (next) {
  try {
    if (this.role === "service-provider" && this.serviceProviderProfile) {
      const providerProfile = await ServiceProvider.findById(
        this.serviceProviderProfile._id
      );
      if (!!providerProfile?.vehicleRegistrationNumber) {
        this.isVerified = true;
      } else {
        this.isVerified = false;
      }
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
