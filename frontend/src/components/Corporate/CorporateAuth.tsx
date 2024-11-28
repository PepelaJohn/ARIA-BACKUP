import React, { useEffect, useRef, useState } from "react";
import { Check, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import OTP from "../OTP";
import IndividualRate from "./IndividualRates";
import { MdClose } from "react-icons/md";
import { gsap } from "gsap";
import { createUser } from "../../api";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import FilterableSelect from "../FilterSelect";
const images = [
  "/src/assets/bg.jpg",
  "/src/assets/bus.jpg",
  "/src/assets/bg.jpg",
  "/src/assets/bus.jpg",
];
const BusinessAccountForm: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const secretKey = import.meta.env.VITE_SECRET_KEY as string;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const circleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [countries, setCountries] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    country: "Kenya",
    address: "",
    city: "",
    taxId: "",
    password: "",
    repeatPassword: "",
    alternateNumber: "",
  });

  useEffect(() => {
    setFormData({ ...formData, country: selectedCountry });
    console.log(formData);
  }, [selectedCountry]);

  useEffect(() => {
    fetch(
      "https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code"
    )
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.countries);
        // setFormData({ ...formData, country: data.userSelectValue });
      });
  }, []);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isCommonPassword = (password: string) => {
    const commonPasswords = ["password", "qwerty", "abc123"];
    return commonPasswords.includes(password); // || /^(?:\d+|\D+)$/.test(password);
  };
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const step1 = () => {
      const name = formData.firstName;
      const name2 = formData.lastName;
      if (!name || name?.length < 2) {
        newErrors.firstName = "Invalid Name. ";
      }

      if (!validateEmail(formData.email!))
        newErrors.email = "Invalid email address.";

      if (!name2 || name2?.length < 2) {
        newErrors.lastName = "Invalid Name. ";
      }

      if (!formData.phoneNumber || formData.phoneNumber.length > 13)
        newErrors.phoneNumber = "Please Input a valid phone number.";
    };

    const step2 = () => {
      if (!formData.companyName)
        newErrors.companyName = "Please Input company Name.";

      if (!formData.address) newErrors.adress = "Please Input a valid address.";

      if (!formData.city) newErrors.city = "Please Input City of operation.";

      // if (!formData.country) newErrors.country = "Please country of operation.";
    };

    const step3 = () => {
      if (formData.password.length < 4)
        newErrors.password = "Password must be at least 4 characters.";
      if (formData.password !== formData.repeatPassword)
        newErrors.repeatPassword = "Passwords do not match.";
      if (isCommonPassword(formData.password))
        newErrors.password = "Password is too common.";
    };

    const submit = () => {
      step1();
      step2();
      step3();
    };

    step === 0
      ? step1()
      : step === 1
      ? step2()
      : () => {
          step3();
          submit();
        };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (validateForm()) {
      const { repeatPassword, ...user } = formData;
      const response = await createUser(
        {...user, country:'Kenya'} as unknown as userData,
        "corporate"
      );

      if (response.status === 201) {
        const { username, name, _id, role, isVerified, providerType } =
          response.data;
        setEncryptedCookie(role, isVerified, name, _id, providerType);
        localStorage.setItem("user", JSON.stringify({ username, _id }));
        setSubmitting(false);
        setStep((prev) => (prev + 1) as any);
      } else {
        setSubmitting(false);
        toast("Error Ocurred, Please refresh and try again!");
      }
    }
  };
  useEffect(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        translateX: open ? -1000 : 0,
        translateY: open ? -700 : 0,
        width: open ? 5000 : 0,
        height: open ? 5000 : 0,
        ease: "power2.inOut",
        duration: 1,
      });
    }

    if (contentRef.current) {
      if (open) {
        gsap.set(contentRef.current, { display: "flex" });
        gsap.to(contentRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: "power2.inOut",
        });
      } else {
        gsap.to(contentRef.current, {
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(contentRef.current, { display: "none" });
          },
        });
      }
    }
  }, [open]);

  return (
    <div className="flex flex-col relative z-0  md:flex-row h-screen bg-[url('/src/assets/bgr.png')] overflow-hidden bg-gray-100 bg-repeat bg-fixed">
      <div
        ref={circleRef}
        className="absolute rounded-full bg-black z-20 "
      ></div>
      <div
        ref={contentRef}
        className="absolute inset-0 bg-black hidden flex-col  items-center justify-center text-3xl  z-20"
      >
        {["HOME", "Ride", "Business"].map((cont, i) => (
          <div key={i} className="p-2 uppercase text-white my-2">
            <Link
              className="hover:text-primaryOrange transitionEase"
              to={`${cont === "HOME" ? "/" : `/${cont.toLowerCase()}`}`}
            >
              {cont}
            </Link>
          </div>
        ))}
      </div>

      {/* Left Section */}
      <div
        className={`bg-black bg-[url("${images[step]}")] transitionEase max-md:hidden relative z-10  bg-cover bg-opacity-90  h-screen text-white md:w-1/3 flex flex-col  p-8 space-y-6`}
      >
        <div className="absolute inset-0 bg-black opacity-60 -z-10"></div>
        <h1 className="text-3xl font-bold">UNLOCK YOUR CORPORATE ADVANTAGES</h1>
        <ul className="space-y-4  text-lg">
          <li className="flex items-start py-4 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>{" "}
            Register in less than 2 minutes
          </li>
          <li className="flex items-start py-4 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>
            Book rides for a team for a reduced price.
          </li>
          <li className="flex items-start py-4 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>{" "}
            Use flexible payment options (e.g. credit card, invoice)
          </li>
          <li className="flex items-start py-4 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>
            Get a personal corporate service person.
          </li>
          <li className="flex items-start py-4 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>
            Easily manage rides.
          </li>
        </ul>
        <div className="flex items-end flex-1">
          <span>
            Copyright © 2024 Aria Inc <span className="pl-2">·</span>
            <span className="text-primaryOrange cursor-pointer px-2">
              Terms of Service
            </span>{" "}
            ·{" "}
            <span className="text-primaryOrange cursor-pointer px-2">
              Privacy Policy
            </span>{" "}
            ·{" "}
            <span className="text-primaryOrange cursor-pointer px-2">
              Cookie Settings
            </span>
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1  flex flex-col overflow-auto  p-8 md:p-16">
        <div className="w-full flex items-center mb-6 justify-between">
          <h2 className="text-3xl transitionEase font-bold  uppercase">
            {
              [
                "3 STEPS TO A FREE corporate ACCOUNT",
                "1 step closer to optimized mobility",
                "",
                "",
                "",
                "",
              ][step]
            }
          </h2>

          <div
            className={`z-50 cursor-pointer relative  font-bold w-8 flex justify-center ${
              open ? "text-white" : "text-black"
            }`}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <MdClose
                className={`transitionEase text-2xl text-white`}
              ></MdClose>
            ) : (
              <Menu className="transitionEase"></Menu>
            )}
          </div>
        </div>
        <div className="">
          {/* Personal Details */}
          <div className="gap-12 flex flex-col">
            <div className="flex  justify-between  items-center">
              <div className="w-5/6 max-md:w-full  h-1 relative  bg-gray-300 rounded-full">
                <div
                  className={`h-full   bg-orange-500 ${
                    step > 0 ? `width-${step}` : "w-0"
                  } rounded-full`}
                ></div>

                <div className="absolute w-full flex right-0 left-0 top-[100%]">
                  {["Personal Details", "Company Details", "Confirmation"].map(
                    (currentStep, index) => (
                      <p key={index} className="flex-1 text-lg">
                        {index + 1} . {currentStep}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
            {step === 0 && (
              <div className="mt-8 w-5/6 max-md:w-full gap-8 flex flex-col">
                <div className="flex w-full gap-3 ">
                  <div className="flex flex-1 flex-col">
                    <label
                      className="font-semibold text-lg"
                      htmlFor="firstName"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      id="firstName"
                      placeholder=""
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.firstName ? "text-red-500 border-red-500" : ""
                      }`}
                    />
                    {errors?.firstName && (
                      <p className="text-red-500 text-sm">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <label className="font-semibold text-lg" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder=""
                      id="lastName"
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.lastName ? "text-red-500 border-red-500" : ""
                      }`}
                    />
                    {errors?.lastName && (
                      <p className="text-red-500 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 w-full">
                  <div className="flex flex-1 flex-col">
                    <label className="font-semibold text-lg" htmlFor="number">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder=""
                      pattern="^\d{0,12}$"
                      id="number"
                      className={`border-gray-400 p-2 w-full shake-input bottom-border ${
                        errors?.phoneNumber ? "text-red-500 border-red-500" : ""
                      }`}
                    />
                    {errors?.phoneNumber && (
                      <p className="text-red-500 text-sm">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <label className="font-semibold text-lg" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=""
                      id="email"
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.email ? "text-red-500 border-red-500" : ""
                      }`}
                    />
                    {errors?.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {(step === 1 || step === 2) && (
              <div className="mt-8 w-5/6 max-md:w-full gap-8 flex flex-col">
                <div className="flex w-full gap-3 ">
                  <div className="flex flex-1 flex-col">
                    <label
                      className="font-semibold text-lg"
                      htmlFor="companyName"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      id="companyName"
                      placeholder=""
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.companyName ? "text-red-500 border-red-500" : ""
                      }`}
                    />
                    {errors?.companyName && (
                      <p className="text-red-500 text-sm">
                        {errors.companyName}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <label className="font-semibold text-lg" htmlFor="country">
                      Country
                    </label>

                    {/* <Select
                    styles={{borderTop:'none'}}
                    className={`border-gray-400 p-2 w-full bottom-border ${
                      errors?.country ? "text-red-500 border-red-500" : ""
                    }`}
                      onChange={(selected) =>
                        setFormData({ ...formData, country: selected as any })
                      }
                      options={countries}
                      value={formData.country}
                    ></Select> */}
                    {/* <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      id="country"
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.country ? "text-red-500 border-red-500" : ""
                      }`}
                    >
                      {
                        countries.map((country:any)=>{
                          
                          return (<option key={country.label} value={country.label.split(" ")[1]}>{country.label.split(" ")[1]}</option>)
                        })
                      }

                    </select> */}

                    <FilterableSelect
                      selectedCountry={selectedCountry}
                      className={`border-gray-400 outline-none p-2 w-full bottom-border ${
                        errors?.country ? "text-red-500 border-red-500" : ""
                      }`}
                      options={countries}
                      setValue={setSelectedCountry}
                    ></FilterableSelect>
                    {errors?.country && (
                      <p className="text-red-500 text-sm">{errors.country}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 w-full">
                  <div className="flex flex-1 flex-col">
                    <label className="font-semibold text-lg" htmlFor="address">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder=""
                      id="address"
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.address ? "text-red-500 border-red-500" : ""
                      }`}
                    />
                    {errors?.address && (
                      <p className="text-red-500 text-sm">{errors.address}</p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <label className="font-semibold text-lg" htmlFor="city">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder=""
                      id="city"
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.city ? "text-red-500 border-red-500" : ""
                      }`}
                    />

                    {errors?.city && (
                      <p className="text-red-500 text-sm">{errors.city}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 w-full">
                  <div className="flex flex-1 flex-col">
                    <label className="font-semibold text-lg" htmlFor="taxid">
                      Tax Id (Optional)
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      placeholder=""
                      id="taxid"
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.taxId ? "text-red-500 border-red-500" : ""
                      }`}
                    />
                    {errors?.taxId && (
                      <p className="text-red-500 text-sm">{errors.taxId}</p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <label
                      className="font-semibold text-lg"
                      htmlFor="alternateNumber"
                    >
                      Alternate Phone Number
                    </label>
                    <input
                      type="number"
                      name="alternateNumber"
                      placeholder=""
                      value={formData.alternateNumber}
                      onChange={handleChange}
                      id="alternateNumber"
                      className={`border-gray-400 p-2 w-full bottom-border ${
                        errors?.alternateNumber
                          ? "text-red-500 border-red-500"
                          : ""
                      }`}
                    />

                    {errors?.alternateNumber && (
                      <p className="text-red-500 text-sm">
                        {errors.alternateNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <OTP
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                submitting={submitting}
              ></OTP>
            )}
          </div>

          {step === 3 && <IndividualRate></IndividualRate>}

          {step < 3 && (
            <div className="mt-[40px] flex flex-col gap-5 ">
              <button
                onClick={() => {
                  if (validateForm()) {
                    setStep((prev) => (prev + 1) as 0 | 1 | 2 | 3);
                  }

                  // if (step <= 2) {
                  //   setStep((prev) => (prev + 1) as 0 | 1 | 2 | 3);
                  //   console.log(step);
                  // }
                }}
                className="bg-primaryOrange transitionEase w-[300px]  hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                NEXT
              </button>
              <p className="text-sm text-gray-500">
                If you are not a business customer, please visit{" "}
                <Link to="/" className="text-primaryOrange underline">
                  aria.com
                </Link>
                . Do you already have a business account?{" "}
                <Link to="/auth" className="text-primaryOrange underline">
                  Login now
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessAccountForm;
