export  interface UserProfileType {
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
  corporateProfile?: string; 
  serviceProviderProfile?: string;

  phoneNumber?: string;
}

export  interface CorporateProfileType {
  userId: string; 
  companyName: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
}
export  interface ProviderProfile {
  userId: string; 
  services: string[]; 
  providerType: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
  vehicleRegistrationNumber?: string;
  averageRating: number;
  preferredPayment?: string;

  ratings: string[];
}
