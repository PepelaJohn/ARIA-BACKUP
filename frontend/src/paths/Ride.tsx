import React, { SetStateAction, useEffect, useRef, useState } from "react";
import MapGL, { Layer, Marker, NavigationControl, Source } from "react-map-gl";
import "tailwindcss/tailwind.css";
import { DatePicker } from "../components/DatePicker";
import Cab from "../assets/taxi.png";
import Rider from "../assets/rider.png";
import Jet from "../assets/plane.png";
import Truck from "../assets/truck.png";
import Drone from "../assets/drone.png";
import Shuttle from "../assets/Shuttle.png";
import { useSearchParams } from "react-router-dom";
const images = { Cab, Rider, Jet, Truck, Drone, Shuttle };
import {
  calculateDistanceKm,
  handleLocationSearchMapbox,
  handleSuggestionClick,
} from "../utils";
import { toast } from "react-toastify";
import { MdLocationPin } from "react-icons/md";
import { AxiosResponse } from "axios";
import { useSocket } from "../context/socketProvider";
import { createOrder } from "../api";
import RidePopup from "../components/ChooseRide";

// const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface AxiosResponseCustom extends AxiosResponse {
  data: { message: string; order: { [key: string]: string } };
}

interface ServiceOption {
  id: number;
  name: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
  ratePerKm: number;
}

interface ServiceProvider {
  lat: number;
  lng: number;
  userId: string;
  providerType: string;
  socketid: string;
}

const serviceOptions: ServiceOption[] = [
  { id: 1, name: "Rider", ratePerKm: 20 },
  { id: 2, name: "Drone", ratePerKm: 50 },
  { id: 3, name: "Cab", ratePerKm: 30 },
  { id: 4, name: "Shuttle", ratePerKm: 40 },
  { id: 5, name: "Truck", ratePerKm: 80 },
  { id: 6, name: "Jet", ratePerKm: 300 },
];
const Ride: React.FC = () => {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [searchParams] = useSearchParams();
  const pickupLat = searchParams.get("pickupLat");
  const pickupLng = searchParams.get("pickupLng");
  const pickupLocation = searchParams.get("pickupLocation");
  const dropoffLat = searchParams.get("dropoffLat");
  const dropoffLng = searchParams.get("dropoffLng");
  const dropoffLocation = searchParams.get("dropoffLocation");
  const pickupDate = searchParams.get("pickupDate");

  const MAPBOX_API_KEY = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [onlineProviders, setOnlineProviders] = useState<ServiceProvider[]>([]);
  const [pickup, setPickup] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [selectedoption, setSelectedoption] = useState<0 | 1 | 2 | 3 | null>(
    null
  );
  const socketContext = useSocket();
  const getCost = (selected: number) => {
    console.log("getting cost", selected);
    if (pickup && destination && selected) {
      const distance = calculateDistanceKm(pickup, destination);
      const selectedOption = serviceOptions.find(
        (service) => service.id === selected
      );

      if (selectedOption) {
        return Math.round(distance * selectedOption.ratePerKm);
      }
    }
    return 0;
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const [formData, setFormData] = useState({
    pickupDate: Date,
    pickupLocation: "",
    dropoffLocation: "",
  });

  const [ploading, setpLoading] = useState(false);
  const [dloading, setdLoading] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 51.5074, // Sample coordinates (London)
    longitude: -0.1276,
    zoom: 10,
    width: "100%",
    height: "400px",
  });
  const handleShowRoute = () => {
    if (pickupCoords && dropoffCoords) {
      const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords.longitude},${pickupCoords.latitude};${dropoffCoords.longitude},${dropoffCoords.latitude}?geometries=geojson&access_token=${MAPBOX_API_KEY}`;
      fetch(routeUrl)
        .then((response) => response.json())
        .then((data) => {
          setRouteData(data.routes[0].geometry);
        })
        .catch((error) => toast("Error fetching route data", error));
    }
  };

  const createUserOrder = async () => {
    // alert()
    if (
      pickup?.latitude &&
      pickup.longitude &&
      destination?.latitude &&
      destination.longitude &&
      selectedoption !== null
    ) {
      const data: AxiosResponseCustom = await createOrder({
        serviceType: serviceOptions[selectedoption].name,
        pickupDate: formData.pickupDate as any,
        destination: {
          lat: pickup?.latitude,
          long: pickup.longitude,
          name: formData.pickupLocation,
        },
        location: {
          lat: destination.latitude,
          long: destination.longitude,
          name: formData.dropoffLocation || "User Locatioon",
        },
        price: getCost(selectedoption + 1),
      });

      if (data.status === 201 && data.data.message) {
        toast(data.data.message);
        localStorage.setItem("order", JSON.stringify(data.data.order));
        socketContext?.setShowOrderLoad(true);
      }
    } else {
      // alert();
    }
  };
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      handleShowRoute();
    }
  }, [pickupCoords, dropoffCoords]);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setViewport({
          ...viewport,
          latitude: position.coords.latitude,
          longitude: position.coords.latitude,
          zoom: 10,
        });
      },
      (error) => console.error("Error getting location: ", error),
      { enableHighAccuracy: true }
    );
  }, []);
  const [date, setDate] = useState<Date>();
  useEffect(() => {
    !!date && setFormData({ ...formData, pickupDate: date as any });
  }, [date]);
  useEffect(() => {
    setOnlineProviders(
      socketContext?.onlineProviders as unknown as SetStateAction<
        ServiceProvider[]
      >
    );
  }, [socketContext?.onlineProviders.length]);

  const [pricePopup, setPricePopup] = useState(false);

  useEffect(() => {
    if (
      !!pickupLat &&
      !!pickupLng &&
      !!pickupLocation &&
      !!dropoffLat &&
      !!dropoffLng &&
      !!dropoffLocation &&
      !!pickupDate
    ) {
      setFormData({
        dropoffLocation,
        pickupDate: pickupDate as any,
        pickupLocation,
      });
      setPickup({ latitude: pickupLat as any, longitude: pickupLng as any });
      setDestination({
        latitude: dropoffLat as any,
        longitude: dropoffLng as any,
      });
      setPickupCoords({
        latitude: pickupLat as any,
        longitude: pickupLng as any,
      });
      setDropoffCoords({
        latitude: dropoffLat as any,
        longitude: dropoffLng as any,
      });
      if (submitButtonRef.current) {
        setViewport({
          ...viewport,
          latitude: pickupLat as any,
          longitude: pickupLng as any,
        });

        // handleShowRoute()
        submitButtonRef.current.click();
      }
    }
  }, [submitButtonRef.current]);
  return (
    <div className=" nav-h h-full bg-[url('/src/assets/bgr.png')] bg-gray-100 bg-repeat bg-fixed overflow-hidden relative flex flex-col ">
      {/* Video Background */}
      {pricePopup && (
        <div className="absolute inset-0 h-full bg-black bg-opacity-70 z-10">
          <RidePopup
            selectedoption={selectedoption}
            setSelectedoption={setSelectedoption}
            setPricePopup={setPricePopup}
            pickup={pickup}
            destination={destination}
            createUserOrder={createUserOrder}
          ></RidePopup>
        </div>
      )}
      <main className="flex w-full h-full flex-1 items-center  p-8 space-x-10 justify-center text-black relative">
        {/* Left Content */}
        <div className="flex w-1/4 justify-start h-[700px]">
          <section className="w-full space-y-4 flex flex-col ">
            <h1 className="text-4xl font-bold">Order a service.</h1>

            {/* Location Inputs */}
            <div className="space-y-2">
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="Pickup location"
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
                  className="w-full p-3 h-[50px] border rounded-md bg-white text-black"
                />

                <span className="absolute bottom-1 left-0 right-0">
                  {pickupSuggestions && (
                    <ul className="absolute w-full text-black z-10 bg-white rounded mt-1 max-h-60 overflow-y-auto">
                      {ploading && (
                        <span className="flex px-3 py-2 flex-row gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></span>
                        </span>
                      )}
                      {pickupSuggestions.map((option, index) => (
                        <li
                          onClick={() => {
                            setViewport({
                              ...viewport,
                              latitude: option.geometry.coordinates[1],
                              longitude: option.geometry.coordinates[0],
                            });

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
              <div className="w-full relative">
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
                  placeholder="Dropoff location"
                  className="w-full p-3 h-[50px] border rounded-md bg-white text-black"
                />
                <span className="absolute bottom-1 left-0 right-0">
                  {dropoffSuggestions && (
                    <ul className="absolute w-full text-black z-10 bg-white  rounded mt-1 max-h-60 overflow-y-auto">
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
                            setViewport({
                              ...viewport,
                              latitude: option.geometry.coordinates[1],
                              longitude: option.geometry.coordinates[0],
                            });
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
            </div>

            {/* Date and Time Select */}
            <div className="flex space-x-4">
              <button className="flex-1 p-3 h-[50px] border rounded-md bg-white text-black">
                Today
              </button>
              <DatePicker date={date} setDate={setDate}></DatePicker>
              {/* <button className="flex-1 p-3 border rounded-md bg-white text-black">Now</button> */}
            </div>

            <button
              ref={submitButtonRef}
              onClick={() => {
                if (
                  formData.pickupLocation &&
                  formData.dropoffLocation &&
                  pickup &&
                  destination
                ) {
                  setPricePopup(true);
                }
              }}
              className="p-3 bg-black text-white rounded-md mt-4"
            >
              See prices
            </button>
          </section>
        </div>

        {/* Map Section */}
        <section className="w-[600px] !ml-20  h-[700px]">
          <MapGL
            {...viewport}
            mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN}
            onMove={(newViewport: any) => setViewport(newViewport)}
            mapStyle="mapbox://styles/mapbox/streets-v11"
          >
            {pickupCoords && (
              <Marker
                anchor="center"
                color="red"
                latitude={pickupCoords.latitude}
                longitude={pickupCoords.longitude}
              >
                <MdLocationPin className="text-blue-600 text-5xl"></MdLocationPin>
              </Marker>
            )}
            {dropoffCoords && (
              <Marker
                color="blue"
                latitude={dropoffCoords.latitude}
                longitude={dropoffCoords.longitude}
              >
                <MdLocationPin className="text-red-600 text-5xl"></MdLocationPin>
              </Marker>
            )}
            {routeData && (
              <Source
                id="route"
                type="geojson"
                data={{ type: "Feature", geometry: routeData }}
              >
                <Layer
                  id="route-layer"
                  type="line"
                  paint={{
                    "line-color": "#0000ff", // Blue color for the route
                    "line-width": 2, // Line thickness
                  }}
                />
              </Source>
            )}
            {onlineProviders.map((provider) => (
              <Marker
                draggable={true}
                key={provider.userId}
                latitude={provider.lat}
                longitude={provider.lng}
                offset={[
                  Math.floor(1 + Math.random() * (5 - 1 + 1)),
                  Math.floor(1 + Math.random() * (5 - 1 + 1)),
                ]}
              >
                <img
                  src={images[provider.providerType as keyof typeof images]}
                  alt={provider.providerType}
                  className="h-6"
                />
              </Marker>
            ))}
            <NavigationControl style={{ right: 10, top: 10 }} />
          </MapGL>
        </section>
      </main>
    </div>
  );
};

export default Ride;
