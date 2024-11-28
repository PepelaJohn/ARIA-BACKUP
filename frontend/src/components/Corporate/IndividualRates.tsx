import React from "react";
import image from "../../assets/RateOfferr.png";
import { Link } from "react-router-dom";
const IndividualRate: React.FC = () => {
  return (
    <div className="flex flex-col mt-12 items-center justify-center h-full bg-white px-4">
      {
        <>
          <div className="text-center">
            <h1 className="text-4xl font-bold uppercase text-gray-900">
              YOUR INDIVIDUAL RATE
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Individual offer for ARIA International 
            </p>
          </div>

          <div className="flex flex-col items-center mt-6">
            <p className="text-orange-500 text-4xl  font-extrabold">
              12% Discount
            </p>
            <p className="text-gray-600 text-base mt-1">
              on our website, or personal app
            </p>
          </div>

          <div className="mt-6 w-3/5">
            <img
              src={image} // Replace with actual image URL
              alt="Car"
              className="max-w-full h-auto"
            />
          </div>
        </>
      }

      <div className="flex gap-4 mt-8">
        <button className="border border-orange-500 text-orange-500 px-6 py-2 rounded-md font-bold hover:bg-orange-100 transition">
          <Link to="/">REJECT DISCOUNT</Link>
        </button>
        <button className="bg-orange-500 text-white px-6 py-2 rounded-md font-bold hover:bg-orange-600 transition">
          <Link to={"/corporate/quote"}> ACCEPT OFFER AND BOOK NOW</Link>
        </button>
      </div>
    </div>
  );
};

export default IndividualRate;
