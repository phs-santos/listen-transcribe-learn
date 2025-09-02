import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { Navigate } from "react-router-dom";

const Index = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user) {
        return user.role === "admin" ? (
            <Navigate to="/admin" replace />
        ) : (
            <Navigate to="/dashboard" replace />
        );
    }

    return <Navigate to="/login" replace />;
};

export default Index;
