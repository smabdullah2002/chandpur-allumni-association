import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const isUserRoleAllowed = (role, requiredRole) => {
  if (!requiredRole) {
    return true;
  }

  const normalizedRole = role || "";
  if (Array.isArray(requiredRole)) {
    if (requiredRole.includes(normalizedRole)) {
      return true;
    }
    return requiredRole.includes("user") && normalizedRole === "member";
  }

  if (requiredRole === "user") {
    return normalizedRole === "user" || normalizedRole === "member";
  }

  return normalizedRole === requiredRole;
};

export default function ProtectedRoute({ children, requiredRole }) {
  const { auth } = useAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isUserRoleAllowed(auth.user?.role, requiredRole)) {
    return <Navigate to="/" replace />;
  }

  if (
    auth.user?.role === "user" &&
    auth.user?.status !== "approved" &&
    (!requiredRole ||
      requiredRole === "user" ||
      requiredRole.includes?.("user"))
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
