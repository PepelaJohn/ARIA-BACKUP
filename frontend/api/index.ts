import { AxiosError, AxiosResponse } from "axios";
import axios, { AxiosInstance } from "axios";
import { Bounce, toast } from "react-toastify";

const authHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",

  Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
};

const url: string = "https://aria-api-gr-w.vercel.app/";

const API: AxiosInstance = axios.create({
  responseType: "json",

  withCredentials: true,
  baseURL: url,

  headers: {
    ...authHeaders,
  },
});

// Axios interceptor
API.interceptors.response.use(
  (response: AxiosResponse) => {
    // allows succesful responses to pass through
    return response;
  },
  (error: AxiosError) => {
    // checks if the error response has a status code
    if (error.response) {
      const { status, data } = error.response;

      if (status >= 400 && status < 600) {
        // Display the error message from the backend
        const message = (data as any).message || "An error occurred.";
        console.log(message + " api "); // replace later with toast
        toast(message, {
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
    }

    // Reject the promise
    return Promise.reject(error);
  }
);

interface orderType {
  serviceType: "Rider" | "Cab" | "Jet" | "Drone" | "Truck" | "Shuttle";
  location: { lat: number; long: number; name: string };
  destination: { lat: number; long: number; name: string };
  price: number;
  pickupDate: Date | string;
}

type userType = "service-provider" | "consumer" | "admin" | "corporate";

export const verifyEmail = async (cipher: string) =>
  API.post(
    `${url}api/auth/user/verify`,
    { cipher },
    { headers: authHeaders, withCredentials: true }
  );
export const createUser = (
  data: userData,
  role: userType
): Promise<AxiosResponse> =>
  API.post(`${url}api/auth/user/sign-up/${role}`, data, {
    headers: authHeaders,
    withCredentials: true,
  });

export const loginUser = (
  data: userData,
  role: userType
): Promise<AxiosResponse> =>
  API.post(`${url}api/auth/user/sign-in/${role}`, data, {
    headers: authHeaders,
    withCredentials: true,
  });

export const logoutUser = (id: string): Promise<AxiosResponse> =>
  API.post(
    `${url}api/auth/user/sign-out/consumer`,
    { id },
    { headers: authHeaders, withCredentials: true }
  );

export const createQuote = (data: any) =>
  API.post(`${url}api/corporate/quote`, data, {
    headers: authHeaders,
    withCredentials: true,
  });

export const refreshToken = (id: string) =>
  API.post(`${url}refresh/${id}`, {
    headers: authHeaders,
    withCredentials: true,
  });

export const createOrder = (data: orderType) =>
  API.post(`${url}api/service/order`, data, {
    headers: authHeaders,
    withCredentials: true,
  });
export const acceptOrder = (id: string) =>
  API.post(`${url}api/service/order/${id}`, {
    headers: authHeaders,
    withCredentials: true,
  });
export const cancelOrder = (id: string) =>
  API.put(`${url}api/service/cancel/${id}`, {
    headers: authHeaders,
    withCredentials: true,
  });
export const startJourney = (id: string, time: Date) =>
  API.post(
    `${url}api/service/start/${id}`,
    { time },
    { headers: authHeaders, withCredentials: true }
  );
export const finishJourney = (id: string, time: Date) =>
  API.post(
    `${url}api/service/finish/${id}`,
    { time },
    { headers: authHeaders, withCredentials: true }
  );
export const rateService = (
  id: string,
  data: { rating: number; review?: string }
) =>
  API.post(`${url}api/service/rate/${id}`, data, {
    headers: authHeaders,
    withCredentials: true,
  });

// Get pending quotes
export const getPendingQuotes = () =>
  API.get(`${url}api/corporate/quotes/pending`, {
    headers: authHeaders,
    withCredentials: true,
  });

// Get details of a specific quote
export const getQuoteDetails = (id: string) =>
  API.get(`${url}api/corporate/quotes/${id}`, {
    headers: authHeaders,
    withCredentials: true,
  });

// Accept a quote
export const acceptQuote = (id: string) =>
  API.post(
    `${url}api/corporate/quotes/accept/${id}`,
    {},
    { headers: authHeaders, withCredentials: true }
  );

// Cancel a quote
export const cancelQuote = (id: string) =>
  API.put(
    `${url}api/corporate/quotes/cancel/${id}`,
    {},
    { headers: authHeaders, withCredentials: true }
  );

// Edit a quote
export const editQuote = (id: string, data: Record<string, unknown>) =>
  API.put(`${url}api/corporate/quotes/edit/${id}`, data, {
    headers: authHeaders,
    withCredentials: true,
  });

// Finish a quote (mark it as completed)
export const finishQuote = (id: string) =>
  API.post(
    `${url}api/corporate/quotes/finish/${id}`,
    {},
    { headers: authHeaders, withCredentials: true }
  );

export const getRatings = () =>
  API.get(`${url}api/ratings`, { headers: authHeaders, withCredentials: true });

interface MessageData {
  [key: string]: any;
}

export const fetchAllServiceOrders = () =>
  API.get(`${url}api/service-orders`, {
    headers: authHeaders,
    withCredentials: true,
  });
export const fetchOneServiceOrder = (id: string) =>
  API.get(`${url}api/service-orders/${id}`, {
    headers: authHeaders,
    withCredentials: true,
  });
// Fetch all messages associated to user
export const getMessages = (): Promise<AxiosResponse> =>
  API.get(`${url}/users/chat`, { headers: authHeaders, withCredentials: true });

// Fetch a single message by ID, specifying if it's a group message
export const getMessage = (
  id: string,
  isGroup: boolean
): Promise<AxiosResponse> =>
  API.get(`${url}/chat/${id}`, {
    headers: authHeaders,
    withCredentials: true,
    params: { isGroup: isGroup.toString() },
  });

// Send a new message
export const sendMessage = (data: MessageData): Promise<AxiosResponse> =>
  API.post(`${url}/users/chat`, data, {
    headers: authHeaders,
    withCredentials: true,
  });

export default API;
