import { Request, Response } from "express";
import Rating from "../models/Ratings";
import ServiceProvider from "../models/ServiceProvider";

interface IRequest extends Request {}

export const getRatings = async (req: IRequest, res: Response) => {
  try {
    const userId = req.userId;
    let role = req.role;

    console.log(role, 'ahdjfahlfd');
    if (!role) role = "consumer";

    if (!userId) return res.status(400).json({ message: "Bad Request." });

    let ratings: any[] = [];
    let averageRating: number = 0;
    if (role === "service-provider") {
      const user = await ServiceProvider.findOne({ userId });
      console.log(role, user)
      if (!user) return res.status(404).json({ message: "User Not found." });
      const providerRatings = await Rating.find({ serviceProviderId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("consumerId", "name _id username img");

      averageRating = user.averageRating;

      if (!!providerRatings.length) {
        ratings = [...providerRatings];
      }
    } else {
      const corporateorUserRating = await Rating.find({ consumerId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("serviceProviderId", "name _id username img");

      if (!!corporateorUserRating.length) {
        ratings = [...corporateorUserRating];
      }
    }

    let data: any = { ratings };

    if (role === "service-provider" && averageRating) {
      data = { ...data, averageRating: averageRating };
    }

    return res.status(200).json(data);
  } catch (error: any) {
      console.log("Error getting Rating: ", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
