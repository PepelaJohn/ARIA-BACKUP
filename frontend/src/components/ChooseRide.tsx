import React, { useEffect, useState } from "react";
import { SelectOptions } from "./Select";
import { MdClose } from "react-icons/md";
import { calculateDistanceKm, formatNumberWithCommas } from "../utils";
import Cab from "../assets/taxi.png";
import Rider from "../assets/rider.png";
import Jet from "../assets/plane.png";
import Truck from "../assets/truck.png";
import Drone from "../assets/drone.png";
import Shuttle from "../assets/Shuttle.png";
import { useSocket } from "../context/socketProvider";
import { Button } from "./ui/button";
import { cancelOrder } from "../api";
const images = { Cab, Rider, Jet, Truck, Drone, Shuttle };

interface RideOption {
  type: string;
  seats: number;
  description?: string;
}

interface OrderItemType {
  location: Location;
  destination: Location;
  _id: string; // orderId
  consumerId: string;
  serviceType: string;
  price: number;
  status: string;
  serviceProviderId: string;
}

interface ServiceOption {
  id: number;
  name: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
  ratePerKm: number;
}

const serviceOptions: ServiceOption[] = [
  { id: 1, name: "Rider", ratePerKm: 30 },
  { id: 2, name: "Drone", ratePerKm: 50 },
  { id: 3, name: "Cab", ratePerKm: 44 },
  { id: 4, name: "Shuttle", ratePerKm: 280 },
  { id: 5, name: "Truck", ratePerKm: 170 },
  { id: 6, name: "Jet", ratePerKm: 800 },
];

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Props {
  selectedoption: 0 | 1 | 3 | 2 | null;
  setSelectedoption: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | null>>;
  setPricePopup: React.Dispatch<React.SetStateAction<boolean>>;
  pickup: Coordinates | null;
  destination: Coordinates | null;
  createUserOrder(): void;
}

const RidePopup = ({
  selectedoption,
  setSelectedoption,
  setPricePopup,
  pickup,
  destination,
  createUserOrder,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const socketContext = useSocket();

  const rides: RideOption[] = [
    { type: "Rider", seats: 1 },
    { type: "Drone", seats: 0 },
    { type: "Cab", seats: 3, description: "Comfortable rides for upto 3" },
    {
      type: "Shuttle",
      seats: 14,
      description: "Affordable rides for groups of upto 14",
    },
    {
      type: "Truck",
      seats: 2,
      description: "Affordable cargo carriers within and without town",
    },
    {
      type: "Jet",
      seats: 7,
      description: "Experience great luxury while saving time.",
    },
  ];

  const getCost = (selected: number) => {
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

  useEffect(() => {
    if (socketContext?.showOrderLoad) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [socketContext?.showOrderLoad]);
  // const socketContext = useSocket();
  const order: OrderItemType = JSON.parse(localStorage.getItem("order")!);
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className={`bg-white rounded-lg shadow-lg w-[90%] max-w-xl p-6 transition-all duration-500 ${
          isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="w-full flex justify-between items-center">
          <h2 className="text-xl font-semibold">Choose your best option</h2>
          <span
            onClick={() => setPricePopup(false)}
            className="rounded-full w-8 h-8 flex items-center justify-center text-lg text-gray-50 cursor-pointer bg-gray-400"
          >
            <MdClose />
          </span>
        </div>

        <div className="mt-5 overflow-auto h-[450px]">
          {rides.map((ride, index) => (
            <div
              onClick={() => {
                setSelectedoption(index as any);
              }}
              key={index}
              className={`flex transitionEase cursor-pointer items-center p-4 mb-2 border rounded-lg ${
                index === selectedoption ? "border-black" : ""
              }`}
            >
              <span className="flex gap-3 text-xl items-center">
                <span className="max-h-full text-xl w-16 mr-4">
                  <img src={images[ride.type as keyof typeof images]} alt="" />
                </span>
              </span>
              <div className="flex-1">
                <p className="font-semibold">
                  {ride.type}
                  <span className="text-gray-500 font-light">
                    {" "}
                    · {ride.seats} seat{ride.seats === 1 ? "" : "s"}
                  </span>
                </p>
                {ride.description && (
                  <p className="text-gray-400 text-xs">{ride.description}</p>
                )}
              </div>
              <p className="font-semibold">
                KES {formatNumberWithCommas(getCost(index + 1))}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center gap-4 mt-6">
          <div className="flex justify-between items-center gap-4 mt-6">
            <SelectOptions>
            
            </SelectOptions>
            <button
              onClick={createUserOrder}
              disabled={selectedoption === null}
              className="bg-black disabled:cursor-not-allowed disabled:bg-slate-800 text-white rounded-lg px-6 py-2"
            >
              Request
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute flex gap-10 flex-col items-center justify-center w-full h-full bg-opacity-5   bg-gray-100">
          <div className="flex justify-center items-center flex-col rounded-lg shadow-lg w-[90%] max-w-xl p-6 transition-all duration-500 gap-10 bg-white">
            <p className="text-lg">Hold tight, your ride is coming...</p>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-700"></div>

            <Button
              onClick={async () => {
                const data = await cancelOrder(order._id);
                if (data.status === 200) {
                  socketContext?.setShowOrderLoad(false);
                  localStorage.removeItem("order");
                }
              }}
              className="bg-black hover:bg-black"
            >
              Cancel Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RidePopup;
