
import React from "react";

interface NewOrderPopupProps {
  location: { lat: number; long: number; name: string };
  destination: { lat: number; long: number; name: string };
  price: number;
  onAccept?: () => void;
  onIgnore?: () => void;
  orderId: string;
}

const NewOrderPopup: React.FC<NewOrderPopupProps> = ({
  location,
  destination,
  price,
  onAccept,
  onIgnore,
}) => {
  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 bg-black flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-center mb-4">
            New Order Request
          </h2>

          <p className="t">
            <strong>From :</strong> {location?.name}
          </p>
          <p className=" my-2">
            <strong>To :</strong> {destination?.name}
          </p>
          <p><strong>Price: </strong>{price}</p>

          <div className="flex justify-center items-center  gap-5">
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Accept
            </button>
            <button
              onClick={onIgnore}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewOrderPopup;
