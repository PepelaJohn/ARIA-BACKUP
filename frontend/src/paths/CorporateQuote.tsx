import React, { useEffect, useRef, useState } from "react";
import { Check, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createQuote } from "../api";
import { toast } from "react-toastify";
import { MdClose } from "react-icons/md";
import { gsap } from "gsap";
interface Coordinates {
  lat: string;
  long: string;
  name: string;
}
const BusinessAccountForm: React.FC = () => {
  const navigate = useNavigate()
  const MAPBOX_API_KEY = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;
  const [ploading, setpLoading] = useState(false);
  const [dloading, setdLoading] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [pickup, setPickup] = useState<Coordinates>({
    long: "",
    lat: "",
    name: "",
  });
  const [destination, setDestination] = useState<Coordinates>({
    long: "",
    lat: "",
    name: "",
  });
  const handleSuggestionClick = (
    suggestion: any,
    setCoords: React.Dispatch<React.SetStateAction<Coordinates>>,
    setSuggestions: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setCoords({
      lat: suggestion.geometry.coordinates[1],
      long: suggestion.geometry.coordinates[0],
      name: suggestion.place_name,
    });
    setSuggestions([]); // Clear suggestions after selection
  };
  const handleLocationSearchMapbox = (
    location: string,
    setSuggestions: React.Dispatch<React.SetStateAction<any[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!location.trim()) {
      setSuggestions([]); // Clear suggestions when input is empty
      // Clear the location state as well
      return;
    }
    setLoading(true);
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${MAPBOX_API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          setSuggestions(data.features); // Update suggestions
        } else {
          setSuggestions([]); // Clear suggestions if no results
          // Clear location state
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching location data", error);
      });
  };

  const [formData, setFormData] = useState({
    email: "",
    contact: "",
    pickup: "",
    dropOff: "",
    pickupDate: "",
    returnTrip: "false",
    returnDate: "",
    vehiclePreference: "",
    passengers: "",
    specialNeeds: "false",
    specialNeedsRequirements: "",
    budgetEstimate: "",
    additionalNotes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      email,

      contact,

      passengers,
    } = formData;
    if (
      (contact &&
        email &&
        formData.pickup &&
        formData.dropOff &&
        passengers &&
        pickup.lat &&
        pickup.long &&
        destination.lat &&
        destination.long,
      formData.pickupDate)
    ) {
      const { pickup:alt, dropOff, ...req } = formData;
      const finalData = {
        ...req,
        pickup,
        dropOff: destination,
      };

      
      const data = await createQuote(finalData as any);

      if (data.status === 200) {
        toast(data.data.message, { autoClose: 1500 });
        navigate('/')
      }
    }
  };
  const [open, setOpen] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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

  const getUserLocation = () => {
    // alert()
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickup({
          lat: position.coords.latitude as unknown as string,
          long: position.coords.latitude as unknown as string,
          name: "My Location",
        });

        console.log(position);
        setPickupSuggestions([]);
        setpLoading(false);

        setFormData({ ...formData, pickup: "My Location" });
      },
      (error) => console.error("Error getting location: ", error),
      { enableHighAccuracy: true }
    );
  };
  return (
    <div className="flex bg-[url('/src/assets/bgr.png')] h-full bg-gray-100 bg-repeat bg-fixed relative flex-col md:flex-row overflow-hidden max-h-screen ">
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
        className={`bg-black bg-[url("/src/assets/bg.jpg")] transitionEase   max-md:hidden relative z-10  bg-cover bg-opacity-90  h-screen text-white md:w-1/3 flex flex-col  p-8 space-y-6`}
      >
        <div className="absolute inset-0 bg-black opacity-60 -z-10"></div>
        <h1 className="text-3xl font-bold">CORPORATE ADVANTAGES</h1>
        <ul className="space-y-4  text-lg">
          <li className="flex items-start py-3  !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>
            Book rides for a team for a reduced price.
          </li>
          <li className="flex items-start py-3 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>{" "}
            Use flexible payment options (e.g. credit card, invoice)
          </li>
          <li className="flex items-start py-3 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>
            Get a personal corporate service person.
          </li>
          <li className="flex items-start py-3 !text-xl">
            <span className="mr-4 font-semibold">
              <Check />
            </span>
            Easily manage rides.
          </li>
        </ul>
        <div className="flex items-end flex-1 pb-8 o">
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
      <div className="flex-1 bg-white flex flex-col overflow-auto max-h-screen scrollbar-none p-8 md:p-16">
        <div className="w-full flex items-center mb-6 justify-between">
          <h2 className="text-3xl max-md:text-center text-primaryOrange transitionEase font-bold  max-md:mt-4 transitionEase uppercase">
            REQuest quote
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
          <div className="mt-8 w-5/6 max-md:w-full gap-8 flex flex-col">
            <div className="flex gap-3 w-full">
              <div className="flex flex-col flex-1">
                <label className="font-semibold text-lg" htmlFor="contact">
                  Contact Phone Number *
                </label>
                <input
                  type="number"
                  name="contact"
                  id="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="border-gray-400 shake-input p-2 w-full bottom-border"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label className="font-semibold text-lg" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-gray-400 p-2 shake-input w-full bottom-border"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <div className="flex relative flex-1 flex-col">
                <label className="font-semibold text-lg" htmlFor="pickupName">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  name="pickup"
                  id="pickupName"
                  value={formData.pickup}
                  onChange={(e) => {
                    handleChange(e);
                    handleLocationSearchMapbox(
                      e.target.value,
                      setPickupSuggestions,
                      setpLoading
                    );
                  }}
                  className="border-gray-400 w-full shake-input p-2 bottom-border"
                />
                <span className="absolute bottom-1 left-0 right-0">
                  {!!pickupSuggestions.length && (
                    <ul className="absolute w-full text-black z-10 bg-white rounded mt-1 max-h-60">
                      {ploading && (
                        <span className="flex px-3 py-2 flex-row gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></span>
                        </span>
                      )}
                      <li
                        className="px-3 py-2 hover:bg-gray-100  cursor-pointer"
                        onClick={() => getUserLocation()}
                      >
                        Use My location
                      </li>
                      {pickupSuggestions.map((option, index) => (
                        <li
                          onClick={() => {
                            setFormData({
                              ...formData,
                              pickup: option.place_name,
                            });
                            handleSuggestionClick(
                              option,
                              setPickup,
                              setPickupSuggestions
                            );
                          }}
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100  cursor-pointer"
                        >
                          {option.place_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </span>
              </div>
              <div className="flex relative flex-1 flex-col">
                <label className="font-semibold  text-lg" htmlFor="dropOffName">
                  Drop-off Name *
                </label>
                <input
                  type="text"
                  name="dropOff"
                  id="dropOffName"
                  value={formData.dropOff}
                  onChange={(e) => {
                    handleChange(e);
                    handleLocationSearchMapbox(
                      e.target.value,
                      setDropoffSuggestions,
                      setdLoading
                    );
                  }}
                  className="border-gray-400 w-full shake-input p-2 bottom-border"
                />
                <span className="absolute bottom-1 left-0 right-0">
                  {!!dropoffSuggestions.length && (
                    <ul className="absolute w-full text-black z-10 bg-white  rounded mt-1 max-h-60 ">
                      {dloading && (
                        <span className="flex px-3 py-2 flex-row gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></span>
                        </span>
                      )}
                      {dropoffSuggestions.map((option, index) => (
                        <li
                          onClick={() => {
                            setFormData({
                              ...formData,
                              dropOff: option.place_name,
                            });
                            handleSuggestionClick(
                              option,
                              setDestination,
                              setDropoffSuggestions
                            );
                          }}
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {option.place_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <div className="flex flex-1 flex-col">
                <label className="font-semibold text-lg" htmlFor="pickupDate">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  name="pickupDate"
                  id="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  className="border-gray-400 w-full shake-input p-2 bottom-border"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label className="font-semibold text-lg" htmlFor="returnTrip">
                  Return Trip
                </label>
                <select
                  name="returnTrip"
                  id="returnTrip"
                  value={formData.returnTrip}
                  onChange={handleChange}
                  className="border-gray-400 w-full p-2 bottom-border"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <div className="flex w-full">
              <div className="flex flex-1 flex-col">
                <label className="font-semibold text-lg" htmlFor="returnDate">
                  Return Date (Optional)
                </label>
                <input
                  type="date"
                  name="returnDate"
                  id="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  disabled={formData.returnTrip === "false"}
                  className="border-gray-400 w-full shake-input p-2 bottom-border"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <div className="flex flex-1 flex-col">
                <label
                  className="font-semibold text-lg"
                  htmlFor="vehiclePreference"
                >
                  Vehicle Preference (Optional){" "}
                  <span className="font-light">(E.g Shuttle)</span>
                </label>
                <input
                  type="text"
                  name="vehiclePreference"
                  id="vehiclePreference"
                  value={formData.vehiclePreference}
                  onChange={handleChange}
                  className="border-gray-400 w-full shake-input p-2 bottom-border"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label className="font-semibold text-lg" htmlFor="passengers">
                  Number of Passengers *
                </label>
                <input
                  type="number"
                  name="passengers"
                  id="passengers"
                  value={formData.passengers}
                  onChange={handleChange}
                  className="border-gray-400 w-full shake-input p-2 bottom-border"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <div className="flex flex-1 flex-col">
                <label className="font-semibold text-lg" htmlFor="specialNeeds">
                  Special Needs
                </label>
                <select
                  name="specialNeeds"
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={handleChange}
                  className="border-gray-400 w-full p-2 bottom-border"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="flex flex-1 flex-col">
                <label
                  className="font-semibold text-lg"
                  htmlFor="specialNeedsRequirements"
                >
                  Special Needs Requirements
                </label>
                <input
                  type="text"
                  name="specialNeedsRequirements"
                  id="specialNeedsRequirements"
                  value={formData.specialNeedsRequirements}
                  onChange={handleChange}
                  disabled={formData.specialNeeds === "false"}
                  className="border-gray-400 w-full shake-input p-2 bottom-border"
                />
              </div>
            </div>

            <div className="flex w-full">
              <div className="flex flex-col w-full">
                <label
                  className="font-semibold text-lg"
                  htmlFor="budgetEstimate"
                >
                  Budget Estimate
                </label>
                <input
                  type="text"
                  name="budgetEstimate"
                  id="budgetEstimate"
                  value={formData.budgetEstimate}
                  onChange={handleChange}
                  className="border-gray-400 shake-input p-2 w-full bottom-border"
                />
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex flex-col w-full">
                <label
                  className="font-semibold text-lg"
                  htmlFor="additionalNotes"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="additionalNotes"
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className=" shake-input p-2 w-full outline-none mt-4 border resize-none transitionEase focus-within:border-primaryOrange border-gray-300 min-h-[300px] "
                />
              </div>
            </div>
          </div>

          {
            <div className="mt-[40px] flex flex-col gap-5 ">
              <button
                onClick={handleSubmit}
                className="bg-primaryOrange transitionEase w-[300px]  hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                REQUEST QUOTE
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
          }
        </div>
      </div>
    </div>
  );
};

export default BusinessAccountForm;
