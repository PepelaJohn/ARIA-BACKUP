import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rateService } from "../api";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
const RatingReviewModal = () => {
  const [selected, setSelected] = useState<number>(4);

  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [ratingData, setRatingData] = useState<{
    rating: number;
    review: string;
  }>({
    rating: 4,
    review: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRatingChange = (newRating: number) => {
    setRatingData({ ...ratingData, rating: newRating });
  };

  const handleReviewChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setRatingData({ ...ratingData, review: event.target.value });
  };

  const submitRating = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (orderId) {
      const data = await rateService(orderId, {
        rating: ratingData.rating,
        review: ratingData.review,
      });
      setIsSubmitting(false);
      if (data.status === 200) {
        setSuccessMessage(
          "Rating submitted successfully! You will be redirected shortly..."
        );
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setIsSubmitting(false);
        setErrorMessage("Failed to submit rating. Please try again.");
      }
    }
  };
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const handleMouseOver = (index: number, isHalf: boolean) => {
    setHoverRating(isHalf ? index + 0.5 : index + 1);
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  return (
    <div className="nav-h bg-[url('/src/assets/bgr.png')] min-h-full bg-gray-100 bg-repeat flex-col bg-fixed  flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center w-96 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Rate our Service</h2>
        <p className="text-gray-600 text-center mb-6">
          Your feedback helps us improve and provide the best experience
          possible.
        </p>

        {/* Star Rating */}
        <div className="flex items-center justify-between mb-4">
          {[...Array(5)].map((_, index) => {
            const filledStars = hoverRating || ratingData.rating;
            const isHalf =
              filledStars >= index + 0.5 && filledStars < index + 1;

            return (
              <span
                key={index}
                className="cursor-pointer"
                onClick={() => {
                  handleRatingChange(isHalf ? index + 0.5 : index + 1);
                  //   handleSelection(index);
                  setSelected(index);
                }}
                onMouseOver={() => {
                  setSelected(index);
                  handleMouseOver(index, isHalf);
                }}
                onMouseLeave={() => {
                  handleMouseLeave();
                  setSelected(ratingData.rating - 1);
                }}
              >
                {filledStars >= index + 1 ? (
                  <FaStar size={24} className="text-yellow-400" />
                ) : isHalf ? (
                  <FaStarHalfAlt size={24} className="text-yellow-400" />
                ) : (
                  <FaRegStar size={24} className="text-gray-500" />
                )}
              </span>
            );
          })}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {
            ["Very Sad", "Sad", "Medium", "Happy", "Very Happy"][
              selected
            ]
          }
          {["😢", "😔", "😐", "😊", "😂"][selected]}
        </div>

        {/* Comment Box */}
        <textarea
          className="w-full p-2 h-[150px] border rounded-md text-gray-800 focus:outline-none focus:ring focus:ring-gray-300"
          value={ratingData.review}
          onChange={handleReviewChange}
          placeholder="Leave a review (optional)"
          rows={4}
          onResize={() => {}}
        ></textarea>

        {/* Submit Button */}
        <button
          disabled={isSubmitting || ratingData.rating === 0}
          className="w-full mt-4 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          onClick={submitRating}
        >
          {isSubmitting ? "..." : "Submit"}
        </button>

        {successMessage && (
          <p className="my-8 text-green-500">{successMessage}</p>
        )}
        {errorMessage && <p className="mt-8 text-red-500">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default RatingReviewModal;
