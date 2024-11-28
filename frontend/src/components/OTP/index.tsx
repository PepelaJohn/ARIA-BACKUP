import React, { useState } from "react";
import "./otp.css";
import { Eye, EyeOff } from "lucide-react";
const OTP = ({
  formData,
  handleChange, 
  handleSubmit,
  submitting,
}: {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;

  handleSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  formData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    companyName: string;
    country: string;
    address: string;
    city: string;
    taxId: string;
    password: string;
    repeatPassword: string;
    alternateNumber: string;
  };
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  return (
    <div className="fixed text-md inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className=" max-w-[400px] w-full bg-white p-6 h-[400px] rounded-sm text-center">
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-3 ">
          <h2 className="text-xl font-semibold">CREATE A STRONG PASSWORD</h2>
          <div className="flex flex-1 relative flex-col">
            <input
              type={`${showPassword ? "text" : "password"}`}
              name="password"
              id="firstname"
              placeholder="Enter a password"
              value={formData.password}
              onChange={handleChange}
              className={`border-gray-400 p-2 w-full bottom-border ${
                errors?.password ? "text-red-500 border-red-500" : ""
              }`}
            />
            {errors?.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
            <span className="absolute top-[50%] -translate-y-[50%]  right-[20px]">
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
            </span>
          </div>
          <div className="flex flex-1 flex-col">
            <input
              type="text"
              name="repeatPassword"
              value={formData.repeatPassword}
              onChange={handleChange}
              placeholder="Make sure you remember the password"
              id="lastName"
              className={`border-gray-400 p-2 w-full bottom-border ${
                errors?.repeatPassword ? "text-red-500 border-red-500" : ""
              }`}
            />
            {errors?.repeatPassword && (
              <p className="text-red-500 text-sm">{errors.repeatPassword}</p>
            )}
          </div>

          <div className="w-full mt-5">
            <button
              disabled={submitting}
              type="button"
              onClick={(e) => {
                let newErrors: { [key: string]: string } = {};
                if (formData.password.length < 4) {
                  newErrors.password =
                    "Password must be greater than 4 characters.";
                }

                if (formData.password !== formData.repeatPassword) {
                  newErrors.repeatPassword = "The passwords do not match!";
                }

                setErrors(newErrors);

                if (Object.keys(newErrors).length === 0) {
                  handleSubmit(e);
                }
              }}
              className="bg-primaryOrange disabled:cursor-not-allowed py-2 h-[30px] flex items-center justify-center w-full "
            >
              {submitting ? (
                <span className="flex flex-row gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-.5s]"></span>
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>

        {
          //  <>
          //     <p className="text-3xl font-semibold">VERIFY YOUR EMAIL</p>
          //     <p className="form-card-prompt">
          //       We have sent a code to verify your email address to joho@gmap.com
          //     </p>
          //     <div className="form-card-input-wrapper flex  items-center text-center">
          //       <input
          //         onChange={(e) => {
          //           if (e.target.value.length >= 4) {
          //             e.target.blur();
          //           }
          //         }}
          //         className="form-card-input   "
          //         placeholder="----"
          //         // maxLength={4}
          //         type="tel"
          //       />
          //       <div className="form-card-input-bg bg-gray-200"></div>
          //     </div>
          //     <div className="flex flex-col">
          //       <button
          //         onClick={() => {
          //           if (step <= 3) {
          //             setSteps((prev) => (prev + 1) as 0 | 1 | 2 | 3);
          //           }
          //         }}
          //         className="py-2 px-3 bg-primaryOrange my-4"
          //       >
          //         Verify
          //       </button>
          //       <p className="call-again">
          //         Did not receive code?{" "}
          //         <span>
          //           <button className="text-md text-primaryOrange">Retry</button>
          //         </span>
          //       </p>
          //       <p
          //         onClick={() => setSteps(0)}
          //         className="text-sm mt-4 text-primaryOrange  cursor-pointer"
          //       >
          //         Change Email?
          //       </p>
          //     </div>
          //   </>
        }
      </div>
    </div>
  );
};

export default OTP;
