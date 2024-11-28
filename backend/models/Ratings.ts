import mongoose, { Schema, Document, Types } from "mongoose";

interface Rating extends Document {
  orderId: Types.ObjectId;
  serviceProviderId: Types.ObjectId;
  consumerId: Types.ObjectId;
  rating: number; // Rating score (e.g., 1-5)
  review?: string; // Optional review text
}

const ratingSchema = new Schema<Rating>({
  orderId: { type: Schema.Types.ObjectId, ref: "ServiceOrder", required: true },
  serviceProviderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  consumerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
});

const Rating = mongoose.model<Rating>("Rating", ratingSchema);

export default Rating;
