import { Navigate } from "react-router";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
    requireFounder?: boolean;   // if true, user.isFounder must be true
}

function ProtectedRoute({ children, allowedRoles, requireFounder }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "{}");

    // Not logged in
    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    // Role guard
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to={userRole === "Teacher" ? "/teacher/dashboard" : "/dashboard"} replace />;
        }
    }

    // Founder guard
    if (requireFounder && user?.isFounder !== true) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
