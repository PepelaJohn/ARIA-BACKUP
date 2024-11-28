import { Navigate } from "react-router-dom";
import { getDecryptedCookie } from "../utils";

interface AuthenticatedRouteProps {
  children: JSX.Element;
}

const AuthenticatedRoute = ({ children }: AuthenticatedRouteProps) => {
  const user = getDecryptedCookie();

  if (!user) {
    
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default AuthenticatedRoute;
