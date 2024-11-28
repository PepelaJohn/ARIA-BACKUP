import { Navigate } from "react-router-dom";
import { getDecryptedCookie } from "../utils";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[]; // Roles allowed for this route
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const user = getDecryptedCookie();
  // console.log(user);
  
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to home if not authorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
