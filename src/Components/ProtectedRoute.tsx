import { Navigate } from "react-router";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;