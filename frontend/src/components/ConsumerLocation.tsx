import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { io, Socket } from "socket.io-client";
import L from "leaflet";
import { getCookie } from "../utils";
import mapIcon from '../assets/map.svg'

const accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

interface Location {
  lat: number;
  lng: number;
}



const ConsumerMap: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [providerLocation, setProviderLocation] = useState<Location>({ lat: 0, lng: 0 });
  const [consumerLocation, setConsumerLocation] = useState<Location>({ lat: 0, lng: 0 });

  useEffect(() => {
    // Initialize the socket connection with authentication
    const token = getCookie("access_token");
    if (!token) {
      console.error("Token is missing. Cannot establish socket connection.");
      return;
    }

    const newSocket = io("http://localhost:3000", { auth: { token } });
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  useEffect(() => {
    // Get initial consumer location and handle updates from provider
    const handleLocationSuccess = (position: GeolocationPosition) => {
      setConsumerLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      console.error("Error fetching location:", error.message);
    };

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);

    if (socket) {
      const handleProviderLocationUpdate = (location: Location) => {
        setProviderLocation(location);
      };

      socket.on("providerLocationUpdate", handleProviderLocationUpdate);

      return () => {
        socket.off("providerLocationUpdate", handleProviderLocationUpdate);
      };
    }
  }, [socket]);

  return (
    <MapContainer
      center={consumerLocation}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${accessToken}`}
      />
      <Marker
        position={consumerLocation}
        icon={L.icon({
          iconUrl: "/path/to/consumer-icon.png",
          iconSize: [25, 25],
        })}
      />
      <Marker
        position={providerLocation}
        icon={L.icon({
          iconUrl: mapIcon,
          iconSize: [25, 25],
        })}
      />
      <Polyline positions={[consumerLocation, providerLocation]} color="blue" />
    </MapContainer>
  );
};

export default ConsumerMap;
