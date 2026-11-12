import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader text="Checking session..." />;

  if (user) {
    const from = location.state?.from?.pathname || "/workouts";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
