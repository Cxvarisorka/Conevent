import { Navigate, Outlet } from "react-router";

export default function ProtectRouter() {
  const USER = "null";
  return USER ? <Navigate to="/dashboard" /> : <Outlet />;
}
