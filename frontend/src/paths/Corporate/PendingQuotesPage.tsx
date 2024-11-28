import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingQuotes } from "../../api"; // Your API function to fetch pending quotes

const PendingQuotesPage = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingQuotes = async () => {
      setLoading(true);
      try {
        const response = await getPendingQuotes();
        setQuotes(response.data);
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-800">
        <p className="text-xl animate-pulse">Loading pending quotes...</p>
      </div>
    );

  if (quotes.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-800">
        <p className="text-lg text-red-500">No pending quotes found.</p>
      </div>
    );

  return (
    <div className="min-h-screen nav-h bg-gray-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">
          Pending Quotes
        </h1>
        <div className="space-y-4">
          {quotes.map((quote: any) => (
            <div
              key={quote._id}
              className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <p className="text-lg font-semibold text-gray-800">
                <span className="font-semibold text-gray-500">
                  Tracking ID:
                </span>{" "}
                {quote.trackingId}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-500">Pickup:</span>{" "}
                {quote.pickup.name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-500">Drop-off:</span>{" "}
                {quote.dropOff.name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-500">Status:</span>{" "}
                <span className="px-2 py-1 bg-orange-200 text-orange-600 rounded">
                  {quote.progress}
                </span>
              </p>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => navigate(`/quotes/details/${quote._id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-300"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate(`/quotes/edit/${quote._id}`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-all duration-300"
                >
                  Edit Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingQuotesPage;
