import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuoteDetails, editQuote } from "../../api";

const EditQuotePage = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes("pickup") || name.includes("dropOff")) {
      const [key, field] = name.split(".");
      setEditData((prev: any) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value,
        },
      }));
    } else {
      setEditData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await editQuote(id!, editData);

      if (data.status === 200) {
        navigate(`/quotes/${id}`); // Redirect to the quote details page after editing
      }
    } catch (error) {
      console.error("Error updating quote:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!quote) return <p>No quote found for editing.</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4">
      <div className="max-w-4xl w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-orange-600 mb-6">
          Edit Quote
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Pickup Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Pickup Name:
              </label>
              <input
                type="text"
                name="pickup.name"
                value={editData.pickup?.name || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Pickup Latitude:
              </label>
              <input
                type="text"
                name="pickup.lat"
                value={editData.pickup?.lat || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Pickup Longitude:
              </label>
              <input
                type="text"
                name="pickup.long"
                value={editData.pickup?.long || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Drop-Off Fields */}
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Drop-Off Name:
              </label>
              <input
                type="text"
                name="dropOff.name"
                value={editData.dropOff?.name || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Drop-Off Latitude:
              </label>
              <input
                type="text"
                name="dropOff.lat"
                value={editData.dropOff?.lat || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Drop-Off Longitude:
              </label>
              <input
                type="text"
                name="dropOff.long"
                value={editData.dropOff?.long || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Other Editable Fields */}
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Budget Estimate:
              </label>
              <input
                type="text"
                name="budgetEstimate"
                value={editData.budgetEstimate || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Additional Notes:
              </label>
              <textarea
                name="additionalNotes"
                value={editData.additionalNotes || ""}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuotePage;
