import mongoose, { Schema, Document, Model } from "mongoose";

interface ICorporateProfile extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user
  companyName: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  orders: mongoose.Schema.Types.ObjectId[];
  alternateNumber?: string;
}

const CorporateUser: Schema<ICorporateProfile> = new Schema(
  {
    alternateNumber: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One corporate profile per user
    },
    companyName: { type: String, required: true, trim: true },
    taxId: { type: String, unique: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const CorporateProfile: Model<ICorporateProfile> =
  mongoose.model<ICorporateProfile>("CorporateUser", CorporateUser);

export default CorporateProfile;
