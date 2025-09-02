import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";

export const Recepcao = () => {
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

    if (user && isAuthenticated) {
        return user.role === "admin" ? (
            <Navigate to="/admin" replace />
        ) : (
            <Navigate to="/dashboard" replace />
        );
    }

    return <Navigate to="/login" replace />;
};
