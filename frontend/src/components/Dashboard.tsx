import { useEffect, useState } from "react";
import AnalyticsView from "./AnalyticsView";
import CashflowStat from "./CashflowStat";
import RecentShipment from "./RecentShipment";
import { getDecryptedCookie } from "../utils";

import { fetchAllServiceOrders } from "../api";
interface IServiceOrder {
  _id: string;
  trackingId: string;
  consumerId: ConsumerId;
  serviceType: string;
  price: number;
  status: string;
  __v: number;
  serviceProviderId: ConsumerId;
}

interface ConsumerId {
  _id: string;
  name: string;
  email: string;
}
const Dashboard = () => {
  const user = getDecryptedCookie();
  console.log(user);
  const [data, setData] = useState<IServiceOrder[]>([]);
  const getRecents = async () => {
    const data = await fetchAllServiceOrders();
    if (data.status === 200) {
      // console.log(data.data);
      setData(data.data);
    }
  };

  useEffect(() => {
    getRecents();
  }, []);

  return (
    <div className="flex flex-col  items-center justify-center w-full lg:flex-row h-full">
      {/* Sidebar */}

      <main className="flex-1 flex  flex-col items-center justify-center  h-full w-full">
        <div className="w-full h-[100px]  bg-transparent z-20 p-6 font-semibold flex items-center justify-between text-3xl"></div>

        <div className="flex flex-col  w-full max-w-screen-xl p-6  lg:flex-row gap-6 mt-6">
          {" "}
          <div className="bg-white shadow-md rounded-lg w-full  mx-auto">
            {/* Background section */}
            <div className="relative z-0 ">
              <div className="h-32  -z-0 bg-primaryBlue to-primaryOrange"></div>
              <div className="absolute inset-0 top-6   flex justify-center">
                <img
                  src="https://www.gravatar.com/avatar/?d=mp" // Mock profile picture URL
                  alt={`${user?.name}'s profile`}
                  className="w-44 h-44 rounded-full cursor-pointer border-4 border-white shadow-md"
                />
              </div>
            </div>

            {/* Profile details */}
            <div className="text-center mt-16 p-4">
              <h2 className="text-lg font-bold capitalize">{user?.name}</h2>
              {user?.role === "service-provider" && (
                <p className="text-gray-600 capitalize">{user?.providerType}</p>
              )}
            </div>
          </div>
        </div>
        {user?.role === "service-provider" && (
          <>
            <div className="flex flex-col  w-full max-w-screen-xl p-6  lg:flex-row gap-6 mt-6">
              <AnalyticsView />
              <CashflowStat />
            </div>
          </>
        )}
        <RecentShipment data={data} />
      </main>
    </div>
  );
};

export default Dashboard;
