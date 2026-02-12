import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
    const { user, loading, isAdmin, isAuthorized } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800 dark:border-stone-700 dark:border-t-white"></div>
            </div>
        );
    }

    console.log("ProtectedRoute check:", { path: window.location.pathname, userEmail: user?.email, isAdmin, adminOnly });

    if (!user) {
        console.log("No user found in ProtectedRoute, redirecting to home.");
        return <Navigate to="/" replace />;
    }

    if (adminOnly && !isAuthorized) {
        console.log("User is not authorized in ProtectedRoute, redirecting to home.");
        return <Navigate to="/" replace />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full w-full"
        >
            <Outlet />
        </motion.div>
    );
}
