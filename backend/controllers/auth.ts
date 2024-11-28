import express, { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

import mongoose, { Document } from "mongoose";
import { io } from "../sockets/socket";
import ServiceProviderProfile from "../models/ServiceProvider";
import {
  CorporateProfileType,
  decryptWithAES,
  encryptWithAES,
  ProviderProfile,
  sendEmail,
  UserProfileType,
} from "../utils";
import CorporateProfile from "../models/CorporateUser";

const router = express.Router();

interface UserDocument extends Document {
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
  serviceProviderProfile?: mongoose.Types.ObjectId;
  emailVerificationLink?: string;

  phoneNumber?: string;
}

interface AuthRequest extends Request {
  body: {
    name?: string;
    email?: string;
    username?: string;
    password?: string;

    providerType?: string;
    vehicleRegistrationNumber?: string;
    preferredPayment?: string;
    phoneNumber?: number | null;
    address?: string;
    city?: string;
    companyName?: string;
    country?: string;
    taxId?: string;
    firstName?: string;
    lastName?: string;
    id?: string;

    alternateNumber?: string;
  };
  params: {
    page: string;
    role: "consumer" | "admin" | "service-provider" | "corporate";
  };
}

export const authUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const {
    firstName,
    lastName,
    alternateNumber,
    email,
    id,
    password,
    preferredPayment,
    phoneNumber,

    vehicleRegistrationNumber,
    address,
    city,
    companyName,
    country,
    taxId,
  } = req.body;

  let { username, name } = req.body;

  const { page, role } = req.params;

  const isSignUp = page === "sign-up";
  const isSignIn = page === "sign-in";
  const isSignOut = page === "sign-out";
  if (
    isSignUp &&
    role === "corporate" &&
    (!companyName || !firstName || !lastName)
  ) {
    return res.status(400).json({ message: "Bad Request" });
  }

  if (isSignUp && role === "corporate") {
    username = companyName;
    name = firstName + " " + lastName;
  }

  if (!isSignIn && !isSignUp && !isSignOut) return res.sendStatus(403);

  if (
    (isSignUp && (!username || !email || !password || !name)) ||
    (isSignIn && !(username || email) && !password)
  ) {
    return res.status(400).json({ message: "Input all the credentials" });
  }

  try {
    let currentUser: UserDocument | null = null;

    let providerType: string = "";

    if (isSignUp) {
      if (
        !["consumer", "admin", "service-provider", "corporate"].includes(role)
      ) {
        return res.status(400).json({ message: "Unknown role provided" });
      }

      if (!name || !email || !username || !password)
        return res
          .status(400)
          .json({ message: "All required fields must be filled" });
      currentUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      });
      if (currentUser) {
        return res.status(400).json({ message: "Existing Account found" });
      }

      const hashedPassword = bcryptjs.hashSync(password, 10);

      // const isVerified = role === "consumer";

      if (role === "service-provider" && !req.body.providerType) {
        // console.log('first')
        return res.status(400).json({ message: "Bad request" });
      }
      if (
        role === "corporate" &&
        (!address || !city || !country || !companyName)
      ) {
        res.status(400).json({ message: "All required fields must be filled" });
      }

      currentUser = new User<UserProfileType>({
        name,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        role: role as UserProfileType["role"],

        phoneNumber: phoneNumber! as unknown as string,
      });
      if (role === "service-provider") {
        const providerProfile = new ServiceProviderProfile<ProviderProfile>({
          userId: currentUser._id as string,
          providerType: req.body
            .providerType as ProviderProfile["providerType"],
          preferredPayment: preferredPayment || "Cash",
          vehicleRegistrationNumber: vehicleRegistrationNumber || undefined,
        });

        currentUser.serviceProviderProfile = providerProfile._id as any;
        await providerProfile.save();
        await currentUser.save();
        providerType = providerProfile.providerType;
      }

      if (role === "corporate") {
        const corportateProfile = new CorporateProfile<CorporateProfileType>({
          address: address!,
          city: city!,
          companyName: companyName?.toLowerCase()!,
          country: country!,
          taxId,
          userId: currentUser._id as string,
          alternateNumber,
        });

        currentUser.corporateProfile = corportateProfile._id as any;

        await corportateProfile.save();
        await currentUser.save();
      }

      const encpe = encryptWithAES((currentUser._id as string).toString());
      await sendEmail(
        email,
        `https://aria-front-psi.vercel.app/verify/${encpe}`
      );

      const refreshToken = jwt.sign(
        { _id: currentUser._id, username, name },
        process.env.REFRESH_TOKEN_SECRET as string
      );
      currentUser.refreshToken = refreshToken;
      currentUser.emailVerificationLink = encpe;
      await currentUser.save();
      return res.status(201).json({ message: "OK" });
    } else if (isSignIn) {
      if (!role) return res.status(400).json({ message: "Please select role" });
      if ((!email && !username) || !password)
        return res
          .status(400)
          .json({ message: "All required fields must be filled" });

      currentUser = await User.findOne({
        $or: [
          { email: username?.toLowerCase() },
          { username: username?.toLowerCase() },
        ],
      });

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!currentUser?.isVerified)
        return res.status(307).json({ message: "Not Verified" });

      const validPwd = bcryptjs.compareSync(password!, currentUser.password);
      if (!validPwd) {
        return res.status(401).json({ message: "Wrong credentials" });
      }
      if (currentUser.role === "service-provider") {
        const prov = await ServiceProviderProfile.findOne({
          userId: currentUser._id,
        });
        if (!prov)
          return res.status(404).json({ message: "User does not exist" });
        providerType = prov.providerType;
      }

      let refreshToken = currentUser.refreshToken;
      if (!refreshToken) {
        refreshToken = jwt.sign(
          { _id: currentUser._id, username, name: currentUser.name },
          process.env.REFRESH_TOKEN_SECRET as string
        );
        currentUser.refreshToken = refreshToken;
        await currentUser.save();
      }
    } else if (isSignOut) {
      currentUser = await User.findById(id);

      if (!currentUser) {
        return res.status(403).json({ message: "Forbidden" });
      }

      currentUser.refreshToken = "";
      await currentUser.save();

      res.clearCookie("access_token", {
        httpOnly: false,

        sameSite: "none",
        secure: true,
        priority: "high",
      });
      res.clearCookie("refresh_token", {
        httpOnly: true,

        sameSite: "none",
        secure: true,

        priority: "high",
      });

      return res.status(200).json({ message: "Logged out" });
    }

    const accessToken = jwt.sign(
      {
        _id: currentUser!._id,
        username: currentUser!.username,
        name: currentUser!.name,
      },
      process.env.ACCESS_TOKEN_SECRET as string
    );

    const {
      password: hashed,
      refreshToken,
      isFrozen,

      ...rest
    } = (currentUser as any)._doc as UserDocument;
    const status = isSignIn ? 200 : 201;

    // Refresh token cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "none", // Required for cross-site cookies
      secure: true, // Only over HTTPS
      priority: "high",
    });

    // Access token cookie
    res.cookie("access_token", accessToken, {
      httpOnly: false, // Accessible to client-side JS
      maxAge: 60 * 1000, // 1 minute
      sameSite: "none", // Required for cross-site cookies
      secure: true, // Only over HTTPS
      priority: "high",
    });

    return res.status(status).json({ ...rest, providerType });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { cipher } = data;
    // console.log(cipher);
    if (!cipher)
      return res.status(400).json({ status: 400, message: "bad Request" });

    const encpe = decryptWithAES(cipher);
    let user = await User.findOne({ _id: encpe });

    if (!user || user.emailVerificationLink?.toString() !== cipher.toString()) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request",
      });
    }
    user.isVerified = true;
    user.emailVerificationLink = "";

    await user.save();
    // const { password: pwd, premium, refresh_token, ...rest } = user._doc;
    return res.status(200).json({ message: "OK" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error?.message || "Unknown Error Occured in the Server",
    });
  }
};

export default router;
