import { Navigate, Outlet } from "react-router";

export default function NavigationLayout() {
  const USER = null;
  return !USER ? <Navigate to="/login" /> : <Outlet />;
}
