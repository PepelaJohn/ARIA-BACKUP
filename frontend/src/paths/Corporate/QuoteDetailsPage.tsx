import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuoteDetails, cancelQuote, editQuote, acceptQuote, finishQuote } from "../../api";

const QuoteDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      setLoading(true);
      try {
        const response = await getQuoteDetails(id!);
        setQuote(response.data);
        setEditData(response.data);
      } catch (error) {
        console.error("Error fetching quote details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDetails();
  }, [id]);

  const handleCancel = async () => {
    try {
      await cancelQuote(id!);
      alert("Quote canceled successfully!");
      navigate("/quotes/pending");
    } catch (error) {
      console.error("Error canceling quote:", error);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptQuote(id!);
      alert("Quote accepted successfully!");
      navigate(0); // Reload the page to reflect changes
    } catch (error) {
      console.error("Error accepting quote:", error);
    }
  };

  const handleFinish = async () => {
    try {
      await finishQuote(id!);
      alert("Quote finished successfully!");
      navigate("/quotes/completed");
    } catch (error) {
      console.error("Error finishing quote:", error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await editQuote(id!, editData);
      alert("Quote updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error editing quote:", error);
    }
  };

  if (loading)
    return (
      <div className="flex  justify-center items-center min-h-screen bg-gray-100 text-gray-800">
        <p className="text-xl animate-pulse">Loading quote details...</p>
      </div>
    );

  if (!quote)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-800">
        <p className="text-lg text-red-500">No quote found.</p>
      </div>
    );

  return (
    <div className="min-h-screen nav-h bg-gray-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">
          Quote Details
        </h1>
        <div className="space-y-4">
          <p>
            <span className="font-semibold text-gray-500">Tracking ID:</span>{" "}
            {quote.trackingId}
          </p>
          <p>
            <span className="font-semibold text-gray-500">Pickup:</span>{" "}
            {quote.pickup.name}
          </p>
          <p>
            <span className="font-semibold text-gray-500">Drop-off:</span>{" "}
            {quote.dropOff.name}
          </p>
          <p>
            <span className="font-semibold text-gray-500">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded ${
                quote.progress === "pending"
                  ? "bg-orange-200 text-orange-600"
                  : quote.progress === "in-progress"
                  ? "bg-blue-200 text-blue-600"
                  : quote.progress === "completed"
                  ? "bg-green-200 text-green-600"
                  : "bg-red-200 text-red-600"
              }`}
            >
              {quote.progress}
            </span>
          </p>
        </div>

        {editMode ? (
          <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Pickup Name
              </label>
              <input
                type="text"
                value={editData.pickup.name}
                onChange={(e) =>
                  setEditData((prev: any) => ({
                    ...prev,
                    pickup: { ...prev.pickup, name: e.target.value },
                  }))
                }
                className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:border-orange-400"
              />
            </div>
            {/* Repeat similar inputs for other editable fields */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 flex flex-wrap justify-end gap-4">
            {quote.progress === "pending" && (
              <button
                onClick={handleAccept}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Accept Quote
              </button>
            )}
            {quote.progress === "in-progress" && (
              <button
                onClick={handleFinish}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Finish Quote
              </button>
            )}
            <button
              onClick={() => setEditMode(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
            >
              Edit Quote
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Cancel Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDetailsPage;
