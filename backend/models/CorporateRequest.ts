import mongoose, { Schema, Document } from "mongoose";

export interface ICorporateQuoteRequest extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  serviceProviderId: mongoose.Schema.Types.ObjectId;
  contact: string;
  email: string;
  pickup: {
    long: number | string;
    lat: number | string;
    name: string;
  };
  dropOff: {
    long: number | string;
    lat: number | string;
    name: string;
  };
  pickupDate: Date | string;
  returnTrip?: boolean;
  returnDate?: Date | string;
  vehiclePreference?: string;
  passengers: number;
  specialNeeds?: boolean;
  specialNeedsRequirements?: string;
  additionalNotes?: string;
  budgetEstimate?: string;
  trackingId: string;
  progress: "pending" | "accepted" | "cancelled" | "completed" | "in-progress";
}

const CorporateQuoteRequestSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    pickup: {
      long: { type: Schema.Types.Mixed, required: true },
      lat: { type: Schema.Types.Mixed, required: true },
      name: { type: String, required: true },
    },
    dropOff: {
      long: { type: Schema.Types.Mixed, required: true },
      lat: { type: Schema.Types.Mixed, required: true },
      name: { type: String, required: true },
    },
    pickupDate: { type: Date, required: true },
    returnTrip: { type: Boolean, default: false },
    returnDate: { type: Date },
    vehiclePreference: { type: String },
    passengers: { type: Number, required: true },
    specialNeeds: { type: Boolean, default: false },
    specialNeedsRequirements: { type: String },
    additionalNotes: { type: String },
    budgetEstimate: { type: String },
    serviceProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trackingId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "in-progress"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const CorporateQuoteRequest = mongoose.model<ICorporateQuoteRequest>(
  "CorporateQuoteRequest",
  CorporateQuoteRequestSchema
);

export default CorporateQuoteRequest;
