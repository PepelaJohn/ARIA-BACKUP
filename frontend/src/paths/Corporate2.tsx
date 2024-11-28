import React from "react";

import "tailwindcss/tailwind.css";
import backvid from "../assets/backvid.mp4";

import { SearchIcon } from "lucide-react";
import Typewriter from "typewriter-effect";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
const UberPage: React.FC = () => {
  return (
    <div className=" h-full bg-[url('/src/assets/bgr.png')] min-h-full bg-gray-100 bg-repeat bg-fixed overflow-hidden flex flex-col ">
      {/* Video Background */}
      <div className="w-full h-full  relative flex">
        <video
          autoPlay
          loop
          muted
          className="absolute pointer-events-none top-0 left-0 w-full  object-cover -z-10"
        >
          <source src={backvid} type="video/mp4" />
        </video>

        <div className="absolute inset-0 h-full bg-black bg-opacity-5 -z-10"></div>

        <main className="flex flex-1 items-center   justify-center text-white ">
          <div className="w-[600px] h-[600px] bg-black bg-opacity-40  items-center p-5 text-center justify-center flex flex-col gap-10 relative rounded-full ">
            <span className="flex  uppercase h-[100px] text-3xl typing-effect  items-center justify-center">
              <Typewriter
                options={{
                  strings: ["Your Gateway to Smart Transport Solutions."],
                  autoStart: true,
                  loop: true,
                  delay: 100,
                  deleteSpeed: 40,
                }}
              />
            </span>
            <span className="text-lg font-extralight text-white">
              Book. Track. Ride. Deliver.
            </span>
            <Link to="/ride">
              <Button className="bg-primaryOrange hover:bg-primaryOrange">Book a ride?</Button>
            </Link>
            <div className="flex items-center justify-center absolute left-calc">
              <Link to="/ride">
                <span className="w-[60px] rounded-full   flex items-center justify-center cursor-pointer h-[60px] bg-primaryOrange">
                  <SearchIcon className="  flex items-center justify-center"></SearchIcon>
                </span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UberPage;
