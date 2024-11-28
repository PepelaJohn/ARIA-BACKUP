import { useEffect, useState } from "react";
import AppleSvg from "../components/AppleSvg";
import GoogleSvg from "../components/GoogleSvg";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { createUser, loginUser } from "../api";
import { AtSign, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import ModalPopup from "../components/Modalcontent";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CryptoJS from "crypto-js";
const Auth2 = () => {
  const [searchParams] = useSearchParams();
  let [auth, role] = [searchParams.get("auth"), searchParams.get("role")];
  if (!role) role = "consumer";
  const navigate = useNavigate();
  const [formData, setFormData] = useState<userData>({
    username: "",
    email: "",
    name: "",
    password: "",
    repeatPassword: "",

    providerType: "",
    vehicleRegistrationNumber: "",
    preferredPayment: "",
    phoneNumber: "",
  });

  if (role === "corporate") navigate("/corporate/auth");

  const secretKey = import.meta.env.VITE_SECRET_KEY as string;
  const [isSignUp, setIsSignUp] = useState<boolean>(
    auth === "sign-up" || auth !== "sign-in"
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(role === "service-provider");
  const [serviceData, setServiceData] = useState({
    providerType: "",
    paymentMethod: "",
    phoneNumber: "",
    vehicleRegistrationNumber: "",
  });

  useEffect(() => {
    setIsSignUp(auth === "sign-up" || auth !== "sign-in");
  }, [auth]);

  const [serviceDataProvided, setServiceDataProvided] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isCommonPassword = (password: string) => {
    const commonPasswords = ["password", "qwerty", "abc123"];
    return commonPasswords.includes(password); // || /^(?:\d+|\D+)$/.test(password);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (isSignUp) {
      const name = formData.name;
      console.log(name?.trimEnd().split(" "));
      if (!!name && name?.trimEnd().split(" ")?.length < 2) {
        newErrors.name = "Invalid Name. A valid name must contain a whitespace";
      }

      if (role === "service-provider") {
        if (!formData.providerType)
          newErrors.providerType = "Please select a provider type.";
      }
      if (!validateEmail(formData.email!))
        newErrors.email = "Invalid email address.";
      if (formData.password.length < 4)
        newErrors.password = "Password must be at least 4 characters.";
      if (formData.password !== formData.repeatPassword)
        newErrors.repeatPassword = "Passwords do not match.";
      if (isCommonPassword(formData.password))
        newErrors.password = "Password is too common.";
    }

    if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isSignUp) {
        if (
          serviceDataProvided &&
          serviceData.providerType &&
          serviceData.phoneNumber
        ) {
          // setFormData({ ...formData, role: "service-provider" });
          role === "service-provider";
        }

        const { repeatPassword, ...user } = formData;
        const response = await createUser(user, (role as any) || "consumer");
        
        if (response.status === 201) {
        
          // setEncryptedCookie(role, isVerified, name, _id, providerType);
          // localStorage.setItem("user", JSON.stringify({ username, _id }));
          navigate("/auth?auth=sign-in");
        } else {
          toast("Error Ocurred, Please refresh and try again!");
        }
      } else {
        const { password, username } = formData;

        const response = await loginUser(
          { password, username },
          (role as any) || "consumer"
        );

        if (response.status === 200) {
          const { name, username, _id, role, isVerified, providerType } =
            response.data;
          console.log(response.data);
         

          setEncryptedCookie(role, isVerified, name, _id, providerType);
          localStorage.setItem("user", JSON.stringify({ username, _id }));
          navigate("/");
        } else {
          toast("Error Ocurred, Please refresh and try again!");
        }
      }
    }
  };

  const handleServiceChange = (e: any) => {
    setServiceData({ ...serviceData, [e.target.name]: e.target.value });
  };
  // Encrypt and store data in a cookie
  const setEncryptedCookie = (
    role: string,
    isVerified: boolean,
    name: string,
    _id: string,
    providerType?: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle"
  ) => {
    if (role === "service-provider" && !providerType) {
      toast("Unknown Error Occured.\nPlease refreshm");
      return new Error();
    }
    if (role === "service-provider" && !!providerType) {
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify({
          isVerified: isVerified,
          role: role,
          _id: _id,
          name: name,
          providerType: providerType,
        }),
        secretKey
      ).toString();
      Cookies.set("access_r", encryptedData, {
        secure: true,
        httpOnly: false,
        expires: 30, //30 days
      });
    } else {
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify({ isVerified: isVerified, name, role: role, _id: _id }),
        secretKey
      ).toString();
      Cookies.set("access_r", encryptedData, {
        secure: true,
        httpOnly: false,
        expires: 30, //30 days
      });
    }
  };

  const handleServiceSubmit = () => {
    console.log("Service submitted", serviceData);
    setIsModalOpen(false);
    setFormData({ ...formData, ...serviceData, role: "service-provider" });

    if (serviceData.providerType) {
      toast("Success", { autoClose: 1000 });
    }
  };

  return (
    <div className=" nav-h  bg-[url('/src/assets/bgr.png')] h-fit bg-gray-100 bg-repeat  relative flex flex-col justify-center items-center">
      <main className="flex w-full max-w-2xl items-center  bg-white p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Name */}
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <div
                className={`flex items-center  h-[70px] bottom-border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } h-12 rounded-lg px-3 focus-within:border-primaryOrange`}
              >
                <User></User>

                <input
                  type="text"
                  name="name"
                  autoComplete="off"
                  value={formData.name}
                  onChange={handleChange}
                  required={isSignUp}
                  placeholder="Enter your Names"
                  className={`w-full ml-3   ${
                    errors.name ? "border-red-500" : "border-none"
                  } focus:outline-none text-lg`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-lg">{errors.name}</p>
              )}
            </div>
          )}
          {/* username */}
          <div className="flex flex-col trasitionEase gap-2">
            <div
              className={`flex items-center  h-[70px] bottom-border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } h-12 rounded-lg px-3 focus-within:border-primaryOrange`}
            >
              <AtSign></AtSign>

              <input
                type="text"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your Username"
                className={`w-full ml-3 border-none bottom-border focus:outline-none text-lg ${
                  errors.username ? "border-red-500" : "border-none"
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-lg">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          {isSignUp && (
            <div className="flex flex-col trasitionEase gap-2">
              <div
                className={`flex items-center  h-[70px] bottom-border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } h-12 rounded-lg px-3 focus-within:border-primaryOrange`}
              >
                <Mail className="text-lg"></Mail>

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={isSignUp}
                  placeholder="Enter your Email"
                  className={`w-full ml-3 border-none focus:outline-none text-lg ${
                    errors.email ? "border-red-500" : "border-none"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-lg">{errors.email}</p>
              )}
            </div>
          )}
          {/* Passwords */}

          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center  h-[70px] bottom-border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } h-12 rounded-lg px-3 focus-within:border-primaryOrange`}
            >
              <Lock></Lock>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={`${
                  isSignUp ? "new-password" : "current-password"
                }`}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your Password"
                className={`w-full ml-3 border-none focus:outline-none text-lg ${
                  errors.password ? "border-red-500" : "border-none"
                }`}
              />
              {!showPassword ? (
                <Eye
                  className="cursor-pointer"
                  onClick={() => setShowPassword(true)}
                ></Eye>
              ) : (
                <EyeOff
                  className="cursor-pointer"
                  onClick={() => setShowPassword(false)}
                ></EyeOff>
              )}
            </div>
            {errors.password && (
              <p className="text-red-500 text-lg">{errors.password}</p>
            )}
          </div>
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <div
                className={`flex items-center  h-[70px] bottom-border ${
                  errors.repeatPassword ? "border-red-500" : "border-gray-300"
                } h-12 rounded-lg px-3 focus-within:border-primaryOrange`}
              >
                <Lock></Lock>
                <input
                  type="password"
                  name="repeatPassword"
                  autoComplete="new-password"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  required={isSignUp}
                  placeholder="Re-nter your Password"
                  className={`w-full ml-3 border-none focus:outline-none text-lg ${
                    errors.repeatPassword ? "border-red-500" : "border-nonoe"
                  }`}
                />
              </div>
              {errors.repeatPassword && (
                <p className="text-red-500 text-lg">{errors.repeatPassword}</p>
              )}
            </div>
          )}

          {isSignUp && (
            <button
              onClick={() => {
                navigate(
                  `/auth${window.location.search + "&role=service-provider"}`
                );
                setIsModalOpen(true);
              }}
              type="button"
              className="flex  text-white bg-primaryOrange text-lg justify-center border rounded-lg h-12 items-center flex-col "
            >
              Offer A service?
            </button>
          )}
          {isSignUp && (
            <Link
              to="/corporate/auth"
              className="flex  text-primaryOrange text-lg justify-center border-none  h-12 items-center flex-col "
            >
              <button type="button">Corporate account?</button>
            </Link>
          )}

          {
            <div className="flex justify-between items-center text-lg">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="cursor-pointer" />
                <label className="cursor-pointer">Remember me</label>
              </div>
              {!isSignUp && (
                <span className="text-primaryOrange cursor-pointer">
                  Forgot password?
                </span>
              )}
            </div>
          }

          <button
            type="submit"
            className="mt-4 bg-primaryOrange text-white font-medium rounded-lg h-12 "
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <p className="text-center text-lg mt-2">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}

            <button
              type="button"
              onClick={() => {
                if (isSignUp) {
                  navigate("/auth?auth=sign-in");
                } else {
                  navigate("/auth?auth=sign-up");
                }
              }}
              className="text-blue-500 cursor-pointer"
            >
              {!isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <p className="text-center text-lg my-4 text-gray-500">Or With</p>

          <div className="flex gap-4">
            <button
              type="button"
              className="flex items-center justify-center w-1/2 border border-gray-300 h-12 rounded-lg gap-2 hover:border-primaryOrange"
            >
              <GoogleSvg />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-1/2 border border-gray-300 h-12 rounded-lg gap-2 hover:border-primaryOrange"
            >
              <AppleSvg />
              Apple
            </button>
          </div>
        </form>
      </main>
      {isModalOpen && (
        <ModalPopup
          setServiceData={setServiceData}
          setIsModalOpen={setIsModalOpen}
          handleServiceSubmit={handleServiceSubmit}
          serviceData={serviceData}
          handleServiceChange={handleServiceChange}
          setServiceDataProvided={setServiceDataProvided}
        ></ModalPopup>
      )}
    </div>
  );
};

export default Auth2;
