import { Navigate } from "react-router-dom";
import { getDecryptedCookie } from "../utils";

interface GuestRouteProps {
  children: JSX.Element;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const user = getDecryptedCookie();

  if (!!user) {
    // Redirect to dashboard (or home) if the user is authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
