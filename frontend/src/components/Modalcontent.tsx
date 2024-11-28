import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  setServiceData: React.Dispatch<
    React.SetStateAction<{
      providerType: string;
      paymentMethod: string;
      phoneNumber: string;
      vehicleRegistrationNumber: string;
    }>
  >;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleServiceSubmit: () => void;
  serviceData: {
    providerType: string;
    paymentMethod: string;
    phoneNumber: string;
    vehicleRegistrationNumber: string;
  };
  handleServiceChange: (e: any) => void;
  setServiceDataProvided: React.Dispatch<React.SetStateAction<boolean>>;
};

const Modalcontent = ({
  serviceData,
  handleServiceChange,
  handleServiceSubmit,
  setIsModalOpen,
  setServiceData,
  setServiceDataProvided,
}: Props) => {
  const navigate = useNavigate();
  return (
    <div
      id="clickout"
      onClick={(e) => {
        const ls = (e.target as any).classList;

        let arr = Array.from(ls);
        if (arr.includes("clickout")) {
          navigate("/auth?auth=sign-up");
          setServiceData({
            providerType: "",
            paymentMethod: "",
            phoneNumber: "",
            vehicleRegistrationNumber: "",
          });
          setIsModalOpen(false);
        }
      }}
      className="fixed inset-0 clickout bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          FIll in vehicle Details First
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleServiceSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {/* Provider Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Provider Type
            </label>
            <select
              name="providerType"
              value={serviceData.providerType}
              onChange={handleServiceChange}
              className="w-full border border-gray-300 rounded-lg h-12 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Service</option>
              <option value="Rider">Rider</option>
              <option value="Drone">Drone</option>
              <option value="Shuttle">Shuttle</option>
              <option value="Cab">Cab</option>
              <option value="Jet">Jet</option>
            </select>
          </div>
          {/* Preferred Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Method of Payment
            </label>
            <select
              name="paymentMethod"
              value={serviceData.paymentMethod}
              onChange={handleServiceChange}
              className="w-full border border-gray-300 rounded-lg h-12 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Credit Card">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Mpesa</option>
            </select>
          </div>
          {/* Phone Number */}

          <div className="">
            <label className="block text-sm font-medium mb-1">
              Phone number
            </label>
            <div className="relative ">
              <div className="absolute text-lg inset-y-0 left-3 my-auto h-6 flex items-center border-r pr-2">
                <select
                  disabled
                  value={"+254"}
                  className="text-sm outline-none rounded-lg h-full"
                >
                  <option>+254</option>
                  <option>ES</option>
                  <option>MR</option>
                  <option>KE</option>
                </select>
              </div>
              <input
                type="text"
                name="phoneNumber"
                value={serviceData.phoneNumber || ""}
                onChange={handleServiceChange}
                placeholder="07 (970) 14-749"
                pattern="\d+"
                className="shake-input   h-12 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full pl-[4.5rem] pr-3 py-2 appearance-none bg-transparent outline-none border  rounded-lg"
              />
            </div>
          </div>

          {/* Registration Plate */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Registration Details
            </label>
            <input
              type="text"
              name="vehicleRegistrationNumber"
              value={serviceData.vehicleRegistrationNumber}
              onChange={handleServiceChange}
              placeholder="Enter Registration Number"
              className="w-full border uppercase border-gray-300 rounded-lg h-12 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setServiceDataProvided(false);
                navigate("/auth?auth=sign-up");
                setServiceData({
                  providerType: "",
                  paymentMethod: "",
                  phoneNumber: "",
                  vehicleRegistrationNumber: "",
                });
              }}
              className="text-gray-500 hover:text-black"
            >
              Cancel
            </button>
            <button
              onClick={() => setServiceDataProvided(true)}
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modalcontent;
