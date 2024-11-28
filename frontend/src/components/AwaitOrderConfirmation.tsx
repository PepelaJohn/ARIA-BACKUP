import { cancelOrder } from "../api";
import { useSocket } from "../context/socketProvider";
interface OrderItemType {
  location: Location;
  destination: Location;
  _id: string; // orderId
  consumerId: string;
  serviceType: string;
  price: number;
  status: string;
  serviceProviderId: string;
}
const LoadingPopup = () => {
  const socketContext = useSocket();
  const order: OrderItemType = JSON.parse(localStorage.getItem("order")!);
  return (
    <div className="fixed inset-0 bg-opacity-50 bg-black flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-center mb-4">
          Connecting you to your service provider
        </h2>
        <div className="flex justify-center items-center flex-col gap-5">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-transparent border-blue-600 rounded-full" />
          <button
            onClick={async()=>{
                const data = await cancelOrder(order._id)
                socketContext?.setShowOrderLoad(false)
                if(data.status === 200){
                  localStorage.removeItem('order')
                }
            }}
            className="bg-red-500 p-2 rounded-sm"
          >
            Cancel order
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingPopup;
