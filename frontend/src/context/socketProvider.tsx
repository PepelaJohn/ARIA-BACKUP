import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  SetStateAction,
} from "react";
import io, { Socket } from "socket.io-client";
import { getCookie, getDecryptedCookie } from "../utils";
import { Bounce, toast } from "react-toastify";
import NewOrderPopup from "../components/NewOrderPopup";
import { acceptOrder } from "../api";
import "react-toastify/dist/ReactToastify.css";



interface orderType {
  pickup: { lat: number; long: number; name: string };
  destination: { lat: number; long: number; name: string };
  price: number;
  orderId: string;
}

interface ServiceOrderType {
  _id: string;
  consumerId: string; // ID of the consumer placing the order
  serviceType: "cab" | "drone" | "truck" | "plane";
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    name: string;
  };
  price: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  serviceProviderId?: string; // ID of the assigned service provider
}

interface SocketContextType {
  socket: Socket | null;
  onlineProviders: { [key: string]: string }[];
  setShowOrderLoad: React.Dispatch<SetStateAction<boolean>>;
  showOrderLoad:boolean
}

interface Location {
  lat: number;
  lng: number;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const useSocket = (): SocketContextType | undefined => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showOrderLoad, setShowOrderLoad] = useState(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [onlineProviders, setOnlineProviders] = useState<
    { [key: string]: string }[]
  >([]);
  
  const user = getDecryptedCookie();
  const token = getCookie("access_token");

  const [newOrder, setNewOrder] = useState<orderType | null>(null);

  useEffect(() => {
    if (user?._id && socket?.active) socket.close();

    if (!!user?._id && token) {
      // alert()
      const newSocket = io("http://localhost:3000/api", {
        auth: { token },
        query: { _id: user._id },
      });

      setSocket(newSocket);
      if (user.role === "service-provider") {
        newSocket.off("newOrder");
        newSocket.emit("online", {
          providerType: user.providerType,
        });

        newSocket.on("newOrder", (data: orderType) => {
          setNewOrder(data);
          // alert()

          setOpenPopup(true);
          toast("A new Order has been placed around you", {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
        });
        newSocket.on("orderCanceled", (data: any) => {
          if (data._id === newOrder?.orderId && openPopup) {
            setOpenPopup(false);
            localStorage.removeItem("order");
            toast("Order Canceled", {
              position: "bottom-center",
              autoClose: 2000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
              transition: Bounce,
            });
          }
        });
      } else {
        newSocket?.on("providerLocation", (data: any) => {
          setOnlineProviders(data);
        });
        newSocket?.on("journeyStarted", (data: any) => {
          console.log(data)
        });

        newSocket.on("orderAccepted", (data: ServiceOrderType) => {
          setShowOrderLoad(false);
          toast("Your order has been accepted", {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
          if (!!data) {
            localStorage.setItem("order", JSON.stringify(data));
            window.location.href = `http://localhost:5173/trip/${data._id}`;
          }
        });
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Emit location update to server

          if (user.role === "service-provider") {
            newSocket.emit("providerLocation", {
              ...newLocation,
              userId: user._id,
              providerType: user.providerType,
            });
          }
        },
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true }
      );

      return () => {
        newSocket.off("newOrder");
        newSocket.close();
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [newOrder]);

  const acceptJob = async () => {
    if (!!user && newOrder) {
      const data = await acceptOrder(newOrder?.orderId);

      if (data.status === 200) {
        localStorage.setItem("order", JSON.stringify(data.data.order));
        // navigate(`/trip/${data.data._id}`);

        window.location.href = `http://localhost:5173/trip/${data.data.order._id}`;
      }
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineProviders,
        setShowOrderLoad,
        showOrderLoad
      }}
    >
      {children}
      {openPopup && !!newOrder && (
        <NewOrderPopup
          price={newOrder!.price}
          location={newOrder!.pickup}
          orderId={newOrder!.orderId}
          destination={newOrder!.destination || "Destination"}
          onAccept={() => {
            setOpenPopup(false);
            acceptJob();
          }}
          onIgnore={() => setOpenPopup(false)}
        ></NewOrderPopup>
      )}

      {/* {showOrderLoad && <LoadingPopup></LoadingPopup>} */}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
