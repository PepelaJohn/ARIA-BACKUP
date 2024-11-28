import { useEffect, useState } from "react";
import MapGL, { Layer, Marker, NavigationControl, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "react-toastify";
import { getDecryptedCookie } from "../utils";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/socketProvider";
import axios from "axios";
import { fetchOneServiceOrder, finishJourney, startJourney } from "../api";
import { Button } from "../components/ui/button";
import debounce from 'lodash.debounce';

interface OrderItemType {
  [key: string]: any;
  location: Location;
  destination: Location;
  _id: string;
  trackingId: string;
  consumerId: string;
  serviceType: string;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  serviceProviderId: string;
}

interface Location {
  lat: number;
  long: number;
  name: string;
}

const TripPage = () => {
  const navigate = useNavigate();
  const user = getDecryptedCookie();

  const [journeyStarted, setJourneyStarted] = useState<boolean>(false);
  if (!user) {
    navigate("/");
  }
  const { orderId } = useParams();
  console.log(orderId);

  const [order, setOrder] = useState<OrderItemType>(
    JSON.parse(localStorage.getItem("order")!) || {}
  );

  const socketContext = useSocket();
  if (!order) {
    return <div>Please make an order first</div>;
  }

  const { location: pickupLocation, destination: destinationLocation } = order;

  const [viewport, setViewport] = useState({
    latitude: pickupLocation.lat,
    longitude: pickupLocation.long,
    zoom: 12,
  });

  const [buttonLoading, setButtonLoading] = useState(false);

  const states = [
    "Driver heading towards you",
    "Driving to your destination",
    "Arrived ",
  ];
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [progress, setProgress] = useState(0); // 0 -> Driver on the way to Pickup, 1 -> Pickup, 2 -> Driving to Destination, 3 -> Ride Completed

  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
  const mapboxToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

  const [providerLocation, setProviderLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (user?.role === "service-provider") {
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;

            setLocation({
              lat: latitude,
              lng: longitude,
              accuracy,
            });
            console.log("providerlocation emmiting", position.coords);

            if (socketContext?.socket) {
              socketContext.socket.emit("providerLocationUpdate", {
                lat: latitude,
                lng: longitude,
                consumerId: order.consumerId,
              });
            }
          },
          (err) => {
            toast(`Error getting location: ${err.message}`);
          },
          {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 0,
          }
        );
      }, 5000); //

      return () => {
        clearInterval(intervalId);
      };
    } else {
      if (socketContext?.socket) {
        socketContext.socket.on(
          "providerLocationUpdate",
          (data: { lat: number; lng: number }) => {
            setProviderLocation(data);
          }
        );
      }
    }

    return () => {
      if (socketContext?.socket) {
        socketContext.socket.off("providerLocationUpdate");
      }
    };
  }, [socketContext?.socket, user?.role, order.consumerId]);

  useEffect(() => {
    if (user!.role === "service-provider" && location) {
      setViewport({
        latitude: location.lat,
        longitude: location.lng,
        zoom: 12,
      });
    } else if (user!.role === "consumer" && pickupLocation) {
      setViewport({
        latitude: pickupLocation.lat,
        longitude: pickupLocation.long,
        zoom: 12,
      });
    }
  }, []);

  const fetchUserRoute = async () => {
    console.log(pickupLocation, providerLocation, destinationLocation);
    if (pickupLocation && providerLocation && destinationLocation) {
      let loc = providerLocation;
      if (journeyStarted) {
        loc = { lat: pickupLocation.lat, lng: pickupLocation.long };
      }
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${destinationLocation.long},${destinationLocation.lat};${loc.lng},${loc.lat}`,
          {
            params: {
              access_token: mapboxToken,
              geometries: "geojson",
            },
          }
        );
        setRouteGeoJson(response.data.routes[0].geometry);
        // console.log(response.data.routes[0].geometry);
      } catch (error) {
        console.error("Error fetching user route:", error);
      }
    }
  };
  const fetchProviderRoute = async () => {
    if (pickupLocation && location && destinationLocation) {
      let loc = location;
      if (journeyStarted) {
        loc = {
          lat: pickupLocation.lat,
          lng: pickupLocation.long,
          accuracy: loc.accuracy,
        };
      }
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${destinationLocation.long},${destinationLocation.lat};${loc.lng},${loc.lat}`,
          {
            params: {
              access_token: mapboxToken,
              geometries: "geojson",
            },
          }
        );
        console.log(response.data.routes[0].geometry);
        setRouteGeoJson(response.data.routes[0].geometry);
      } catch (error) {
        console.error("Error fetching provider route:", error);
      }
    }
  };

  useEffect(() => {
    setRouteGeoJson(null);
    if (user?.role === "service-provider") {
      fetchProviderRoute();
    } else {
      fetchUserRoute();
    }
  }, [
    pickupLocation.lat,
    pickupLocation.long,
    destinationLocation.lat,
    destinationLocation.long,
    location?.lat,
    location?.lng,
    journeyStarted,
    providerLocation?.lat,
    providerLocation?.lng,
  ]);

  const getData = async (id: string) => {
    const data = await fetchOneServiceOrder(id);
    console.log(data.data);

    if (data.status === 200) {
      setOrder(data.data);

      switch (data.data.status) {
        case "accepted":
          setProgress(0);

          break;
        case "in-progress":
          setProgress(1);

          break;

        default:
          navigate("/");
          break;
      }
    }

    return data;
  };

  const handleMove = debounce((evt) => {
    setViewport(evt.viewState);
  }, 200); // Debounce with a delay of 200ms

  useEffect(() => {
    orderId && getData(orderId);
  }, []);

  const handleRating = () => {
    navigate(`/trip/rating/${order._id}`);
  };
  useEffect(() => {
    console.log("trip journey start finish");
    socketContext?.socket?.on("journeyStarted", (data: OrderItemType) => {
      setProgress(1);
      sessionStorage.setItem("order", JSON.stringify(data));
      toast("Journey has started");
      setJourneyStarted(true);
    });
    socketContext?.socket?.on("journeyCompleted", () => {
      setProgress(2);
      sessionStorage.removeItem("order");

      setTimeout(() => {
        navigate(`/trip/rating/${order._id}`);
      }, 4000);
    });

    return () => {
      // socketContext?.socket?.off("journeyStarted");
      // socketContext?.socket?.off("journeyCompleted");
    };
  }, [socketContext?.socket]);

  return (
    <div className="nav-h    min-h-screen text-black bg-gray-100 bg-repeat bg-fixed overflow-hidden relative flex flex-col ">
      <main className="flex w-full  flex-col justify-center  h-full   items-center   ">
        <div className="w-[60vw] max-lg:w-[90vw] max-lg:h-[85vh] max-w-screen-2xl bg-blue-400 relative   rounded-md overflow-hidden  h-[80vh]">
          <MapGL
            {...viewport}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            onMove={handleMove}
            mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN}
          >
            <Marker
              latitude={destinationLocation.lat}
              longitude={destinationLocation.long}
              color="red"
            />
            {!journeyStarted ? (
              <>
                {user!.role === "service-provider" && location && (
                  <Marker
                    latitude={location.lat}
                    longitude={location.lng}
                    color="blue"
                  />
                )}
                {user!.role === "consumer" && providerLocation && (
                  <Marker
                    latitude={providerLocation.lat}
                    longitude={providerLocation.lng}
                    color="blue"
                  />
                )}
              </>
            ) : (
              <Marker
                latitude={pickupLocation.lat}
                longitude={pickupLocation.long}
                color="blue"
              />
            )}

            {!!routeGeoJson && (
              <Source
                id="route"
                type="geojson"
                data={{ type: "Feature", geometry: routeGeoJson }}
              >
                <Layer
                  id="route-layer"
                  type="line"
                  paint={{
                    "line-color": "#136af7",
                    "line-width": 4,
                  }}
                />
              </Source>
            )}
            <NavigationControl />
          </MapGL>
          <div className="absolute w-full flex items-center justify-center bg-white bottom-0 z-50   left-0 right-0 h-[100px]">
            {user?.role === "service-provider" ? (
              <button
                onClick={async () => {
                  setButtonLoading(true);
                  if (journeyStarted) {
                    if (orderId || order._id) {
                      const time = new Date();
                      const data = await finishJourney(
                        orderId || order._id,
                        time
                      );
                      setButtonLoading(false);
                      if (data.status === 200) {
                        navigate("/");
                        toast(data.data.message);
                      }
                    }
                  } else {
                    if (orderId || order._id) {
                      const data = await startJourney(
                        orderId || order._id,
                        new Date()
                      );
                      if (data.status === 200) {
                        sessionStorage.setItem(
                          "order",
                          JSON.stringify(data.data)
                        );
                        setButtonLoading(false);
                        setJourneyStarted(true);
                      }
                    }
                  }
                }}
                className="bg-blue-500 p-3 min-w-[120px] text-white rounded sm"
              >
                {buttonLoading ? (
                  <span className="spinner-border animate-spin inline-block w-5 h-5 border-4 border-t-transparent border-gray-600 rounded-full"></span>
                ) : !journeyStarted ? (
                  <>Start Journey</>
                ) : (
                  <>Finish journey</>
                )}
              </button>
            ) : (
              <>
                <div className="progress-bar-container flex items-center justify-between w-[250px] ">
                  {states.map((_, index) => (
                    <div key={index} className={`progress-stop `}>
                      <div
                        className={`circle   border-4 !z-2 ${
                          progress >= index
                            ? "border-primaryOrange"
                            : "border-gray-400"
                        }`}
                      >
                        <div
                          className={`rounded-full w-[20px] h-[20px] ${
                            progress >= index
                              ? "bg-primaryOrange"
                              : "bg-gray-400"
                          } `}
                        ></div>
                        {index < 2 && (
                          <div
                            className={`line !z-0   ${
                              progress > index
                                ? "bg-primaryOrange"
                                : "bg-gray-400"
                            }`}
                          ></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-lg ml-4  justify-center flex items-center ">
                  {states[progress]}.
                </p>
                {progress === 2 && (
                  <Button
                    onClick={handleRating}
                    className="bg-black ml-5 hover:bg-black"
                  >
                    Rate your ride
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripPage;
