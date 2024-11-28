import { Request, Response } from "express";
import { generateUniqueCodeWithTimestamp } from "../utils";
import CorporateQuoteRequest from "../models/CorporateRequest";

import CorporateProfile from "../models/CorporateUser";
// import { getRecipientSocketId, io } from "../sockets/socket";
interface AuthRequest extends Request {
  body: {
    contact: string;
    email: string;
    pickup: { long: number | string; lat: number | string; name: string };
    dropOff: { long: number | string; lat: number | string; name: string };
    pickupDate: Date | string;
    returnTrip?: boolean;
    returnDate?: Date | string;
    vehiclePreference?: string;
    passengers: number;
    specialNeeds?: boolean;
    specialNeedsRequirements?: string;
    additionalNotes?: string;
    budgetEstimate?: string;
  };
}
export const createQuote = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      email,
      pickup,
      dropOff,
      pickupDate,
      vehiclePreference,
      contact,
      returnDate,
      returnTrip,
      budgetEstimate,
      additionalNotes,
      specialNeedsRequirements,
      specialNeeds,
      passengers,
    } = req.body;
    const trackingId = generateUniqueCodeWithTimestamp();

    const userId = req.userId;
    const role = req.role;
    const corporateProfile = await CorporateProfile.findOne({ userId });

    if (role !== "corporate" || !corporateProfile)
      return res
        .status(403)
        .json({ message: "Not allowed to perform this function." });

    if (!contact || !email || !pickup || !dropOff || !passengers)
      return res
        .status(400)
        .json({ message: "All required fields are not provided..." });

    const quote = new CorporateQuoteRequest({
      userId,
      email: email,
      pickup: pickup,
      dropOff: dropOff,
      pickupDate: pickupDate,
      vehiclePreference: vehiclePreference,
      contact: contact,
      returnDate: returnDate,
      returnTrip: returnTrip,
      budgetEstimate: budgetEstimate,
      additionalNotes: additionalNotes,
      specialNeedsRequirements: specialNeedsRequirements,
      specialNeeds: specialNeeds,
      passengers: passengers,
      trackingId: trackingId,
    });

    corporateProfile.orders.push(quote._id as any);
    await corporateProfile.save();
    await quote.save();

    return res.status(200).json({
      message: "Quote created. Our support will get back to you shortly.",
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error." });
  }
};



// Accept a quote
export const acceptQuote = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const quote = await CorporateQuoteRequest.findByIdAndUpdate(
      id,
      { progress: "accepted" },
      { new: true }
    );

    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.status(200).json(quote);
  } catch (err) {
    res.status(500).json({ message: "Error accepting quote", error: err });
  }
};

// Finish a quote
export const finishQuote = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const quote = await CorporateQuoteRequest.findByIdAndUpdate(
      id,
      { progress: "completed" },
      { new: true }
    );

    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.status(200).json(quote);
  } catch (err) {
    res.status(500).json({ message: "Error finishing quote", error: err });
  }
};

// Cancel a quote
export const cancelQuote = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const quote = await CorporateQuoteRequest.findByIdAndUpdate(
      id,
      { progress: "cancelled" },
      { new: true }
    );

    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.status(200).json(quote);
  } catch (err) {
    res.status(500).json({ message: "Error cancelling quote", error: err });
  }
};

// Edit a quote (only if not accepted)
export const editQuote = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const quote = await CorporateQuoteRequest.findById(id);

    if (!quote) return res.status(404).json({ message: "Quote not found" });
    if (quote.progress !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot edit quote once it has been accepted" });
    }

    const updatedQuote = await CorporateQuoteRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: "Error editing quote", error: err });
  }
};

// Get quotes for service provider (not accepted yet)
export const getPendingQuotes = async (req: Request, res: Response) => {
  try {
    const quotes = await CorporateQuoteRequest.find({ status: "pending" }).populate("userId", "name").limit(10);
    res.status(200).json(quotes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending quotes", error: err });
  }
};

// Get a single quote by ID
export const getQuoteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const quote = await CorporateQuoteRequest.findById(id);

    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.status(200).json(quote);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quote", error: err });
  }
};

