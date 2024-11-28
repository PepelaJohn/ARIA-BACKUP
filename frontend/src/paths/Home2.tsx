import { useEffect, useState } from "react";
import { DatePicker } from "../components/DatePicker";
import { handleLocationSearchMapbox, handleSuggestionClick } from "../utils";

import { MdLocationOn } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
interface Coordinates {
  latitude: number;
  longitude: number;
}
const App = () => {
  const [ploading, setpLoading] = useState(false);
  const [dloading, setdLoading] = useState(false);
  const MAPBOX_API_KEY = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

  const [, setPickup] = useState<Coordinates | null>(null);
  const [, setDestination] = useState<Coordinates | null>(null);
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);

  const [date, setDate] = useState<Date>();

  const [formData, setFormData] = useState({
    pickupDate: Date,
    pickupLocation: "",
    dropoffLocation: "",
  });
  const getUserLocation = () => {
    // alert()
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickup({
          latitude: position.coords.latitude,
          longitude: position.coords.latitude,
        });

        setPickupCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.latitude,
        })
        console.log(position);
        setPickupSuggestions([]);
        setpLoading(false);

        setFormData({ ...formData, pickupLocation: "My Location" });
      },
      (error) => console.error("Error getting location: ", error),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    !!date && setFormData({ ...formData, pickupDate: date as any });
  }, [date]);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const navigate = useNavigate();
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  return (
    <div className="min-h-screen  flex flex-col  ">
      {/* Header */}


      <main className="">
        {/* Navbar */}

       
        <div className="pt-[120px] relative  bg-[url('/src/assets/heroimg.png')] bg-cover bg-center min-h-[60vh] text-white">
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-md  shadow-lg p-6 text-black">
              <div className="flex flex-col justify-between items-center ">
                {/* Toggle */}
                <h2 className="text-primaryOrange text-2xl font-semibold w-full">
                  HOP ON
                </h2>

                {/* Date and Location Input */}
                <div className="w-full gap-8 mt-4 min-h-[80px]   relative flex items-center">
                  <div className="flex-1 max-lg:flex-col max-lg:items-start flex items-end gap-8  ">
                    <div className="flex-1 max-lg:w-full relative">
                      <span className="absolute top-[50%] text-primaryOrange left-[10px] text-2xl">
                        <MdLocationOn></MdLocationOn>
                      </span>
                      <label className=" text-sm ">Pick-up</label>
                      <input
                        type="text"
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={(e: any) => {
                          handleChange(e);
                          handleLocationSearchMapbox(
                            e.target.value,

                            setPickupSuggestions,
                            MAPBOX_API_KEY,
                            setpLoading,
                            setPickup
                          );
                        }}
                        placeholder="City or address"
                        className="w-full pl-[40px] border flex-1 h-[50px] border-gray-300 outline-none transisionEase transitionEase focus-within:border-none  focus-within:outline-[3px] focus-within:outline-primaryOrange rounded-md"
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
                                    pickupLocation: option.place_name,
                                  });
                                  handleSuggestionClick(
                                    option,
                                    setPickupCoords,
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

                    <div className="flex-1 max-lg:w-full relative">
                      <span className="absolute top-[50%] text-primaryOrange left-[10px] text-2xl">
                        <MdLocationOn></MdLocationOn>
                      </span>
                      <label className=" text-sm ">Drop Off</label>
                      <input
                        name="dropoffLocation"
                        type="text"
                        value={formData.dropoffLocation}
                        onChange={(e) => {
                          handleChange(e);
                          handleLocationSearchMapbox(
                            e.target.value,
                            setDropoffSuggestions,
                            MAPBOX_API_KEY,
                            setdLoading,
                            setDestination
                          );
                        }}
                        placeholder="City or address"
                        className="w-full focus-within:border-none focus-within:outline-[3px]                                                                      outline-none border pl-[40px] flex-1 h-[50px] border-gray-200 transitionEase focus-within:outline-primaryOrange rounded-md"
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
                                    dropoffLocation: option.place_name,
                                  });
                                  handleSuggestionClick(
                                    option,
                                    setDropoffCoords,
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
                    <div className="">
                      <label className="block text-sm" htmlFor="">
                        Pickup Date
                      </label>
                      <DatePicker
                        className=" h-[50px] w-[150px]"
                        date={date}
                        setDate={setDate}
                      ></DatePicker>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-5">
                  <button
                    onClick={() => {
                      const { latitude: pickupLat, longitude: pickupLng } =
                        pickupCoords || {};
                      const { latitude: dropoffLat, longitude: dropoffLng } =
                        dropoffCoords || {};
                      const { pickupDate, pickupLocation, dropoffLocation } =
                        formData;

                      if (
                        pickupLat &&
                        pickupLng &&
                        dropoffLat &&
                        dropoffLng &&
                        pickupDate &&
                        pickupLocation &&
                        dropoffLocation
                      ) {
                        const data = {
                          pickupLat: pickupLat.toString(),
                          pickupLng: pickupLng.toString(),
                          pickupLocation,
                          dropoffLat: dropoffLat.toString(),
                          dropoffLng: dropoffLng.toString(),
                          dropoffLocation,
                          pickupDate: pickupDate.toString(),
                        };

                        const urlParams = new URLSearchParams(data);
                        console.log(urlParams.toString());
                        navigate(`/ride?${urlParams.toString()}`);
                      } else {
                        toast("All fields are required!", { autoClose: 1000 });
                      }
                    }}
                    className="flex h-[50px] w-[150px] justify-center items-center bg-primaryOrange py-1 px-5 rounded-sm text-white"
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="bg-primaryOrange h-full min-h-[30vh] flex items-center justify-center  text-black text-center py-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">BOOK AND RIDE.</h1>
            <h2 className="text-4xl font-bold">TRACK AND DELIVER. </h2>
            <p className="text-lg mt-4">
              Your Gateway to Smart Transport Solutions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
