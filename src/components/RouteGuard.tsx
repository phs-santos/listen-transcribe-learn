import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { Navigate } from "react-router-dom";

interface RouteGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const RouteGuard = ({
    children,
    requireAdmin = false,
}: RouteGuardProps) => {
    const user = useAuthStore((s) => s.user);
    const isLoading = useAuthStore((s) => s.loginLoading);
    const isAuthenticated = useAppStore((s) => s.isAuthenticated);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
