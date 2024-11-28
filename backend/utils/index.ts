import CryptoJS from "crypto-js";
import base64url from "base64-url";
import nodemailer from "nodemailer";
export function generateUniqueCodeWithTimestamp(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Characters for random string
  let randomString = "";

  // Generate a 6-character random string
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars[randomIndex];
  }

  // Get the current timestamp in a compact format
  const timestamp = Date.now(); // Milliseconds since Jan 1, 1970

  // Combine random string and timestamp
  return `${randomString}${timestamp}`;
}

export interface UserProfileType {
  name: string;
  email: string;
  username: string;
  password: string;
  refreshToken?: string;
  img?: string;
 
  isVerified?: boolean;
  role: "consumer" | "admin" | "service-provider" | "corporate";
  corporateProfile?: string;
  serviceProviderProfile?: string;

  phoneNumber?: string;
}

export interface CorporateProfileType {
  userId: string;
  companyName: string;
  taxId?: string;
  address: string;
  city: string;
  country: string;
  alternateNumber?:string
  
}
export interface ProviderProfile {
  userId: string;

  providerType: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
  vehicleRegistrationNumber?: string;
 
  preferredPayment?: string;

  
}

export const encryptWithAES = (userId: string) => {
  const encrypted = CryptoJS.AES.encrypt(
    userId,
    process.env.SECRET_KEY!
  ).toString();

  // Encode the encrypted string to URL-safe Base64
  const encoded = base64url.encode(encrypted);

  return encoded;
};

export const decryptWithAES = (ciphertext: string) => {
  // Decode the URL-safe Base64 string
  const decoded = base64url.decode(ciphertext);

  // Decrypt the decoded string
  const decryptedBytes = CryptoJS.AES.decrypt(decoded, process.env.SECRET_KEY!);
  const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

  return decrypted;
};

export const sendEmail = async (email: string, url: string) => {
  console.log(url, process.env.USER, process.env.PASS);
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 5158,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    transporter.sendMail({
      from: process.env.USER!,
      to: email,
      subject: 'Email verification"',
      text: `This email was send to you after an attempt to sign up to Aria. If you did not try to sign in please ignore the message.\n\nTo verify you email please open the followin link in your browser ${url} \n\nThank You. \nRegards, Aria.`,
    });
  } catch (error) {
    console.log(error);
  }
};
