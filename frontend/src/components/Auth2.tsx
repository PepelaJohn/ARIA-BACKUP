import { useState } from "react";
import AppleSvg from "./AppleSvg";
import GoogleSvg from "./GoogleSvg";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { createUser, loginUser } from "../api";
import { AtSign, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
const Auth2 = () => {
  const [formData, setFormData] = useState<userData>({
    username: "",
    email: "",
    name: "",
    password: "",
    repeatPassword: "",
    role: "consumer",
    providerType: "",
    vehicleRegistrationNumber: "",
    preferredPayment: "",
    phoneNumber: "",
  });

  const secretKey = import.meta.env.VITE_SECRET_KEY as string;
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  let [errors, setErrors] = useState<{ [key: string]: string }>({});
  
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

      if (formData.role === "service-provider") {
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
        const { repeatPassword, ...user } = formData;
        const response = await createUser(user, "consumer");

        if (response.statusText == "OK") {
          const { username, name, _id, role, isVerified, providerType } =
            response.data;
          if (role === "service-provider") {
            setEncryptedCookie(role, isVerified, name, _id, providerType);
          } else {
            setEncryptedCookie(role, isVerified, name, _id);
          }
          localStorage.setItem("user", JSON.stringify({ username, _id }));
        }
      } else {
        const { password, username, role } = formData;

        const response = await loginUser(
          { password, username, role },
          "consumer"
        );
        console.log(response, response.statusText);
        if (response.statusText == "OK") {
          const { name, username, _id, role, isVerified, providerType } =
            response.data;
          if (role === "service-provider") {
            setEncryptedCookie(role, isVerified, _id, providerType);
          } else {
            setEncryptedCookie(role, isVerified, name, _id);
          }
          localStorage.setItem("user", JSON.stringify({ username, _id }));
        }
      }
    }
  };

  // const handleServiceChange = (e: any) => {
  //   setServiceData({ ...serviceData, [e.target.name]: e.target.value });
  // };
  // Encrypt and store data in a cookie
  const setEncryptedCookie = (
    role: string,
    isVerified: boolean,
    name: string,
    _id: string,
    providerType?: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle"
  ) => {
    if (role === "service-provider" && !providerType) {
      toast("Unknown Error Occured.\nPlease refresh");
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

  // const handleServiceSubmit = () => {
  //   console.log("Service submitted", serviceData);
   
  //   setFormData({ ...formData, ...serviceData, role: "service-provider" });

  //   if (serviceData.providerType) {
  //     toast("Success", { autoClose: 1000 });
  //   }
  // };

  return (
    <div className="h-screen relative flex flex-col justify-center items-center bg-gray-100">
      <main className="flex w-full max-w-lg items-start bg-white p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Name */}
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <div
                className={`flex items-center border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } h-12 rounded-lg px-3 focus-within:border-blue-500`}
              >
                <User></User>

                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={isSignUp}
                  placeholder="Enter your Name"
                  className={`w-full ml-3 b ${
                    errors.name ? "border-red-500" : "order-none"
                  } focus:outline-none text-sm`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          )}
          {/* username */}
          <div className="flex flex-col trasitionEase gap-2">
            <div
              className={`flex items-center border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } h-12 rounded-lg px-3 focus-within:border-blue-500`}
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
                className={`w-full ml-3 border-none focus:outline-none text-sm ${
                  errors.username ? "border-red-500" : "border-none"
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          {isSignUp && (
            <div className="flex flex-col trasitionEase gap-2">
              <div
                className={`flex items-center border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } h-12 rounded-lg px-3 focus-within:border-blue-500`}
              >
                <Mail className="text-sm"></Mail>

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={isSignUp}
                  placeholder="Enter your Email"
                  className={`w-full ml-3 border-none focus:outline-none text-sm ${
                    errors.email ? "border-red-500" : "border-none"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          )}
          {/* Passwords */}

          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } h-12 rounded-lg px-3 focus-within:border-blue-500`}
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
                className={`w-full ml-3 border-none focus:outline-none text-sm ${
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
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <div
                className={`flex items-center border ${
                  errors.repeatPassword ? "border-red-500" : "border-gray-300"
                } h-12 rounded-lg px-3 focus-within:border-blue-500`}
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
                  className={`w-full ml-3 border-none focus:outline-none text-sm ${
                    errors.repeatPassword ? "border-red-500" : "border-nonoe"
                  }`}
                />
              </div>
              {errors.repeatPassword && (
                <p className="text-red-500 text-sm">{errors.repeatPassword}</p>
              )}
            </div>
          )}

          {isSignUp && (
            <div className="flex  text-blue-500 text-sm justify-center border rounded-lg h-12 items-center flex-col ">
              <button type="button">
                Offer A service?
              </button>
            </div>
          )}

          {
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="cursor-pointer" />
                <label className="cursor-pointer">Remember me</label>
              </div>
              {!isSignUp && (
                <span className="text-blue-500 cursor-pointer">
                  Forgot password?
                </span>
              )}
            </div>
          }

          <button
            type="submit"
            className="mt-4 bg-black text-white font-medium rounded-lg h-12 hover:bg-gray-800"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <p className="text-center text-sm mt-2">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}

            <button
              type="button"
              onClick={() => setIsSignUp((prev) => !prev)}
              className="text-blue-500 cursor-pointer"
            >
              {!isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <p className="text-center text-sm my-4 text-gray-500">Or With</p>

          <div className="flex gap-4">
            <button
              type="button"
              className="flex items-center justify-center w-1/2 border border-gray-300 h-12 rounded-lg gap-2 hover:border-blue-500"
            >
              <GoogleSvg />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-1/2 border border-gray-300 h-12 rounded-lg gap-2 hover:border-blue-500"
            >
              <AppleSvg />
              Apple
            </button>
          </div>
        </form>
      </main>
      {
        // isModalOpen && (
        //   <ModalPopup
        //     setServiceData={setServiceData}
        //     setIsModalOpen={setIsModalOpen}
        //     handleServiceSubmit={handleServiceSubmit}
        //     serviceData={serviceData}
        //     handleServiceChange={handleServiceChange}
        //   ></ModalPopup>
        // )
      }
    </div>
  );
};

export default Auth2;
