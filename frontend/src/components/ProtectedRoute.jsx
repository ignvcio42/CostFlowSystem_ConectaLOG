import { Navigate } from "react-router-dom";
import useStore from "../store";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useStore((state) => state);

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/overview" replace />;
  }

  return children;
};

export default ProtectedRoute;
