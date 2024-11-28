import { formatNumberWithCommas } from "../utils";
import { getPendingQuotes } from "../api";
import { useEffect, useState } from "react";
interface ICorporateRequest {
  pickup: Pickup;
  dropOff: Pickup;
  _id: string;
  userId: {
    name: string;
  };
  contact: string;
  email: string;
  pickupDate: string;
  returnTrip: boolean;
  returnDate?: null;
  vehiclePreference?: string;
  passengers: number;
  specialNeeds?: boolean;
  specialNeedsRequirements?: string;
  additionalNotes?: string;
  budgetEstimate?: string;
  trackingId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Pickup {
  long: number;
  lat: number;
  name: string;
}

const CashflowStat = () => {
  const [quotes, setQuotes] = useState<ICorporateRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingQuotes = async () => {
      setLoading(true);
      try {
        const response = await getPendingQuotes();
        setQuotes(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching pending quotes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingQuotes();
  }, []);

  if (loading)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading pending quotes...</p>
      </div>
    );

  if (quotes.length === 0)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex-1 items-center justify-center">
        <p className="text-lg text-red-500">No pending quotes found.</p>
      </div>
    );
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1">
      <h2 className="text-lg font-semibold mb-1">Claim Pending Quotes</h2>
      <h2 className="text-sm font-semibold mb-1">
        {quotes.length} quote{quotes.length !== 1 ? "s" : ""} pending
      </h2>
      {/* Replace with bar chart */}
      <div className="min-h-32  rounded-lg flex items-center justify-start">
        {/* <p className="text-gray-500 flex-shrink">[Bar Chart Placeholder]</p> */}
        {quotes.map((quote, index) => {
          return (
            <>
              {index < 3 ? (
                <div
                  key={index}
                  className="flex bg-gray-100 rounded-md cursor-pointer p-3 gap-1 flex-col"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm capitalize">
                      <strong>From: </strong> {quote.pickup.name}
                    </p>
                    <p className="text-sm capitalize">
                      <strong>To: </strong> {quote.dropOff.name}
                    </p>
                    <p className="text-sm capitalize">
                      <strong>By: </strong> {quote.userId.name}
                    </p>
                  </div>
                  {quote?.budgetEstimate && (
                    <p className="text-sm">
                      <strong>Price:</strong> KES{" "}
                      {formatNumberWithCommas(
                        quote?.budgetEstimate as unknown as number
                      )}
                    </p>
                  )}
                  <button className="bg-primaryOrange p-1 transitionEase rounded-md mt-2">
                    Claim
                  </button>
                </div>
              ) : (
                <></>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};

export default CashflowStat;
