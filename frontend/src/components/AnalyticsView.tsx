
import { getRatings } from "../api";
import { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";



interface IRating {
  ratings: Rating[];
  averageRating: number;
}

interface Rating {
  _id: string;
  orderId: string;
  __v: number;
  consumerId: ConsumerId;
  rating: number;
  review: string;
  serviceProviderId: string;
}

interface ConsumerId {
  _id: string;
  name: string;
  username: string;
  img: string;
}

const AnalyticsView = () => {
  

const [rating, setRating] = useState<IRating>();
  useEffect(() => {
    const getUserRatings = async () => {
      const data = await getRatings();

      if (data.status === 200) {
        setRating(data.data as any)
        console.log(data.data);
      }
    };

    getUserRatings()
  }, []);
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center text-yellow-500">
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={`full-${index}`} />
        ))}
        {hasHalfStar && <FaStar />}
        {[...Array(emptyStars)].map((_, index) => (
          <FaRegStar key={`empty-${index}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 ">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Average Rating & Latest Review
      </h3>

      {/* Average Rating */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">Average Rating</span>
        <div className="flex items-center">
          {renderStars(rating?.averageRating || 0)}
          <span className=" text-gray-600 font-semibold">
            {rating?.averageRating || ""}
          </span>
        </div>
      </div>

      {/* Latest Review */}
      <div className="bg-gray-100 p-3 min-h-32 rounded-md ">
        <p className="text-sm font-semibold ">Latest Review</p>
        <p className="text-sm text-gray-600 capitalize">By {rating?.ratings[rating.ratings.length - 1]?.consumerId?.name ||""}</p>
        <p className="text-sm mt-2">{">> "}{rating?.ratings[rating.ratings.length - 1]?.review || ""}</p>
      </div>
    </div>
  );
};

export default AnalyticsView;
