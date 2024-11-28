import axios from "axios";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import React from "react";

interface DecryptedData {
  isVerified: boolean;
  role: string;
  _id: string;
  name:string;
  providerType?: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
}

const secretKey = import.meta.env.VITE_SECRET_ENCRYPTION_KEY;

export const getDecryptedCookie = (): DecryptedData | null => {
  // Retrieve the cookie value
  const encryptedData = Cookies.get("access_r");

  if (!encryptedData) return null;

  try {
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    // Parse JSON back to object
    return JSON.parse(decryptedText) as DecryptedData;
  } catch (error) {
    console.error("Failed to decrypt or parse cookie data:", error);
    return null;
  }
};

export function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const fetchSuggestionsGoogleMaps = async (
  query: string,
  type: "pickup" | "destination",
  googleMapsApiKey: string,
  setPickupSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>,
  setDestinationSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>
) => {
  if (query.length > 2) {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input: query,
          key: googleMapsApiKey,
          types: "geocode",
          language: "en",
        },
      }
    );

    const suggestions: Suggestion[] = response.data.predictions.map(
      (prediction: any) => ({
        name: prediction.description,
        coordinates: null, // Google Places autocomplete doesn’t return coordinates here
      })
    );

    // Fetch coordinates for each suggestion
    for (const suggestion of suggestions) {
      const detailsResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: suggestion.name,
            key: googleMapsApiKey,
          },
        }
      );
      const location = detailsResponse.data.results[0].geometry.location;
      suggestion.coordinates = {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    if (type === "pickup") setPickupSuggestions(suggestions);
    else setDestinationSuggestions(suggestions);
  }
};

export const fetchSuggestionsNominatim = async (
  query: string,
  type: "pickup" | "destination",
  setPickupSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>,
  setDestinationSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>
) => {
  if (query.length > 2) {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5, // Limit results to reduce unnecessary data
        },
      }
    );

    const suggestions: Suggestion[] = response.data.map((location: any) => ({
      name: location.display_name,
      coordinates: {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
      },
    }));

    if (type === "pickup") setPickupSuggestions(suggestions);
    else setDestinationSuggestions(suggestions);
  }
};

interface Coordinates {
  latitude: number;
  longitude: number;
}
// export const handleLocationSearchMapbox = (
//   location: string,
//   setSuggestions: React.Dispatch<React.SetStateAction<any[]>>,
//   MAPBOX_API_KEY: string,
//   setLoading: React.Dispatch<React.SetStateAction<boolean>>,
//   setLocation: React.Dispatch<React.SetStateAction<Coordinates | null>>
// ) => {
//   if (!location.trim()) {
//     setSuggestions([]); // Clear suggestions when input is empty
//     return;
//   }
//   setLoading(true);
//   fetch(
//     `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${MAPBOX_API_KEY}`
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//       setSuggestions(data.features || []);
//       const [longitude, latitude] = data.features[0].center;
//       setLocation({ latitude, longitude });
//       setLoading(false);
//     })
//     .catch((error) => {
//       setLoading(false);
//       console.error("Error fetching location data", error);
//     });
// };

export const handleLocationSearchMapbox = (
  location: string,
  setSuggestions: React.Dispatch<React.SetStateAction<any[]>>,
  MAPBOX_API_KEY: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setLocation: React.Dispatch<React.SetStateAction<Coordinates | null>>
) => {
  if (!location.trim()) {
    setSuggestions([]); // Clear suggestions when input is empty
    setLocation(null); // Clear the location state as well
    return;
  }
  setLoading(true);
  fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      location
    )}.json?access_token=${MAPBOX_API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.features && data.features.length > 0) {
        setSuggestions(data.features); // Update suggestions

        // Extract coordinates from the first suggestion
        const [longitude, latitude] = data.features[0].center;
        setLocation({ latitude, longitude });
      } else {
        setSuggestions([]); // Clear suggestions if no results
        setLocation(null); // Clear location state
      }
      setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
      console.error("Error fetching location data", error);
    });
};
export const handleSuggestionClick = (
  suggestion: any,
  setCoords: React.Dispatch<React.SetStateAction<Coordinates | null>>,
  setSuggestions: React.Dispatch<React.SetStateAction<any[]>>
) => {
  setCoords({
    latitude: suggestion.geometry.coordinates[1],
    longitude: suggestion.geometry.coordinates[0],
  });
  setSuggestions([]); // Clear suggestions after selection
};

export const calculateDistanceKm = (
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
