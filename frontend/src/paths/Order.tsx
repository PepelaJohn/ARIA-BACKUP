import React, { useState, useEffect, SetStateAction } from "react";
import Map, {
  Marker,
  NavigationControl,
  Source,
  Layer,
} from "react-map-gl";
import { MdLocationPin } from "react-icons/md";
import "mapbox-gl/dist/mapbox-gl.css";
import axios, { AxiosResponse } from "axios";
import Cab from "../assets/cab.png";
import Rider from "../assets/rider.png";
import Plane from "../assets/plane.png";
import Truck from "../assets/truck.png";
import Drone from "../assets/drone.png";
import { fetchSuggestionsNominatim, formatNumberWithCommas } from "../utils";
import { useSocket } from "../context/socketProvider";
import { createOrder } from "../api";
import { toast } from "react-toastify";

const images = { Cab, Rider, Plane, Truck, Drone };
// const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface AxiosResponseCustom extends AxiosResponse {
  data: { message: string; order: { [key: string]: string } };
}

interface ServiceOption {
  id: number;
  name: "Rider" | "Cab" | "Jet" | "Drone" | "Truck";
  ratePerKm: number;
}

interface Suggestion {
  name: string;
  coordinates: Coordinates;
}

interface ServiceProvider {
  lat: number;
  lng: number;
  userId: string;
  providerType: string;
  socketid: string;
}

const serviceOptions: ServiceOption[] = [
  { id: 1, name: "Rider", ratePerKm: 20 },
  { id: 2, name: "Cab", ratePerKm: 30 },
  { id: 3, name: "Drone", ratePerKm: 50 },
  { id: 4, name: "Truck", ratePerKm: 100 },
  { id: 5, name: "Jet", ratePerKm: 300 },
];

const OrderDetails: React.FC = () => {
  const [selectedoption, setSelectedoption] = useState<0 | 1 | 2 | 3 | null>(
    null
  );
  const [pickup, setPickup] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [onlineProviders, setOnlineProviders] = useState<ServiceProvider[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Suggestion[]
  >([]);
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);

  const socketContext = useSocket();

  useEffect(() => {
    setOnlineProviders(
      socketContext?.onlineProviders as unknown as SetStateAction<
        ServiceProvider[]
      >
    );
  }, [socketContext?.onlineProviders.length]);

  const [viewState, setViewState] = useState({
    latitude: -1.292066, // Default to a location
    longitude: 36.821945, // Default to a location
    zoom: 10,
  });
  const mapboxToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setViewState({
          latitude: position.coords.latitude,
          longitude: position.coords.latitude,
          zoom: 10,
        });
        setPickup({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error("Error getting location: ", error),
      { enableHighAccuracy: true }
    );
  }, []);

  const [traveldata, setTraveldata] = useState<{
    pickup: string;
    destination: string;
  }>({ pickup: "", destination: "" });
  const calculateDistanceKm = (
    coord1: Coordinates,
    coord2: Coordinates
  ): number => {
    const R = 6371; // Earth radius in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
    const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.latitude * (Math.PI / 180)) *
        Math.cos(coord2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getCost = (selected: number) => {
    console.log("getting cost", selected);
    if (pickup && destination && selected) {
      const distance = calculateDistanceKm(pickup, destination);
      const selectedOption = serviceOptions.find(
        (service) => service.id === selected
      );

      if (selectedOption) {
        return Math.round(distance * selectedOption.ratePerKm);
      }
    }
    return 0;
  };

  const fetchRoute = async () => {
    if (pickup && destination) {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}`,
        {
          params: {
            access_token: mapboxToken,
            geometries: "geojson",
          },
        }
      );
      setRouteGeoJson(response.data.routes[0].geometry);
    }
  };

  useEffect(() => {
    if (pickup && destination) {
      fetchRoute();
    }
  }, [pickup, destination]);

  const createUserOrder = async () => {
    // alert()
    if (
      pickup?.latitude &&
      pickup.longitude &&
      destination?.latitude &&
      destination.longitude &&
      selectedoption !== null
    ) {
      const data: AxiosResponseCustom = await createOrder({
        pickupDate:new Date(),
        serviceType: serviceOptions[selectedoption].name,
        destination: {
          lat: pickup?.latitude,
          long: pickup.longitude,
          name: traveldata.destination,
        },
        location: {
          lat: destination.latitude,
          long: destination.longitude,
          name: traveldata.pickup || "User Locatioon",
        },
        price: getCost(selectedoption + 1),
      });

      if (data.status === 201 && data.data.message) {
        toast(data.data.message);
        localStorage.setItem('order', JSON.stringify(data.data.order))
        socketContext?.setShowOrderLoad(true)
      }
    } else {
      // alert();
    }
  };

  return (
    <div className="h-fullbg-[url('/src/assets/bgr.png')]  bg-repeat bg-fixed  min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-md space-y-6">
        <h1 className="text-2xl font-semibold mb-4">Create a New Order</h1>

        <div className="space-y-2"></div>

        <div className="space-y-2">
          <label className="block text-gray-300">Pickup Point</label>

          <input
            type="text"
            name="pickup"
            placeholder="Search for pickup location"
            value={traveldata?.pickup}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            onChange={(e) => {
              setTraveldata({ ...traveldata, pickup: e.target.value });
              // fetchSuggestions(e.target.value, "pickup");
              fetchSuggestionsNominatim(
                e.target.value,
                "pickup",

                setPickupSuggestions,
                setDestinationSuggestions
              );
            }}
          />
          <ul className="bg-gray-700 text-white rounded mt-1">
            {!!pickupSuggestions.length && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (pickup) {
                      setPickup(pickup);
                      setPickupSuggestions([]);
                    }
                  }}
                  className=""
                >
                  Use My Location
                </button>
              </li>
            )}
            {pickupSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setPickup(suggestion.coordinates);
                  setTraveldata({ ...traveldata, pickup: suggestion.name });
                  setPickupSuggestions([]);

                  setViewState({
                    latitude: suggestion.coordinates.latitude,
                    longitude: suggestion.coordinates.longitude,
                    zoom: 10,
                  });
                }}
                className="p-2 cursor-pointer hover:bg-gray-600"
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-300">Destination</label>
          <input
            type="text"
            name="destination"
            value={traveldata?.destination}
            placeholder="Search for destination"
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            onChange={(e) => {
              setTraveldata({ ...traveldata, destination: e.target.value });
              // fetchSuggestions(e.target.value, "destination");
              fetchSuggestionsNominatim(
                e.target.value,
                "destination",
                setPickupSuggestions,
                setDestinationSuggestions
              );
            }}
          />
          <ul className="bg-gray-700 text-white rounded mt-1">
            {destinationSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setDestination(suggestion.coordinates);
                  setDestinationSuggestions([]);

                  // setViewState({
                  //   latitude: suggestion.coordinates.latitude,
                  //   longitude: suggestion.coordinates.longitude,
                  //   zoom: 10,
                  // });
                  setTraveldata({
                    ...traveldata,
                    destination: suggestion.name,
                  });
                }}
                className="p-2 cursor-pointer hover:bg-gray-600"
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        </div>

        {
          <div className="h-[500px] overflow-hidden !w-full">
            <Map
              {...viewState}
              style={{ width: "100%", height: "500px" }}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              mapboxAccessToken={mapboxToken}
              onMove={(evt) => setViewState(evt.viewState)}
            >
              <NavigationControl position="top-right" />
              {pickup && (
                <Marker latitude={pickup.latitude} longitude={pickup.longitude}>
                  <MdLocationPin className="text-blue-500 text-xl"></MdLocationPin>
                </Marker>
              )}
              {destination && (
                <Marker
                  latitude={destination.latitude}
                  longitude={destination.longitude}
                >
                  <MdLocationPin className="text-red-500 text-xl"></MdLocationPin>
                </Marker>
              )}
              {routeGeoJson && (
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

              {onlineProviders.map((provider) => (
                <Marker
                  draggable={true}
                  key={provider.userId}
                  latitude={provider.lat}
                  longitude={provider.lng}
                  offset={[
                    Math.floor(1 + Math.random() * (5 - 1 + 1)),
                    Math.floor(1 + Math.random() * (5 - 1 + 1)),
                  ]}
                >
                  <img
                    src={
                      images[
                        (provider.providerType.charAt(0).toUpperCase() +
                          provider.providerType.slice(1)) as keyof typeof images
                      ]
                    }
                    alt={provider.providerType}
                    className="h-6"
                  />
                </Marker>
              ))}
            </Map>
          </div>
        }

        {pickup && destination && (
          <div className="text-lg font-semibold mt-4 flex items-center justify-center flex-col">
            {serviceOptions.map(({ name }, i) => {
              return (
                <div
                  className={`flex w-full justify-between min-h-[100px] items-center py-5 ${
                    selectedoption === i ? "bg-gray-400" : "bg-gray-600"
                  } my-3 px-4 cursor-pointer `}
                  onClick={() => setSelectedoption(i as 1 | 2 | 3 | 0)}
                  key={i}
                >
                  <span className="flex gap-3 text-xl items-center">
                    <span className="max-h-full text-xl w-20">
                      <img
                        src={
                          images[
                            (name.charAt(0).toUpperCase() +
                              name.slice(1)) as keyof typeof images
                          ]
                        }
                        alt=""
                      />
                    </span>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </span>
                  <span>Ksh {formatNumberWithCommas(getCost(i + 1))}</span>
                </div>
              );
            })}

            <div className="w-full flex justify-between gap-2 items-center">
              <button
                type="button"
                onClick={createUserOrder}
             
                className="bg-blue-400 text-white text-lg min-h-[60px] min-w-[150px] flex-[0.5]"
              >
                Place Order
              </button>
              <button
                type="button"
                className="bg-blue-400 text-white text-lg min-h-[60px] min-w-[150px] flex-[0.5]"
              >
                Schedule
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrderDetails;
