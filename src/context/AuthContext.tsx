import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { account } from "../lib/appwrite";
import { OAuthProvider } from "appwrite";
import type { Models } from "appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => Promise<void>;
    verifying: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const ADMIN_EMAIL = "ocamposimon1@gmail.com";

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const accountDetails = await account.get();
            setUser(accountDetails);
            setIsAdmin(accountDetails.email === ADMIN_EMAIL);
        } catch (error) {
            setUser(null);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setVerifying(true);
        try {
            await account.createEmailPasswordSession(email, password);
            const accountDetails = await account.get();
            setUser(accountDetails);
            setIsAdmin(accountDetails.email === ADMIN_EMAIL);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setVerifying(false);
        }
    };

    const loginWithGoogle = () => {
        account.createOAuth2Session(
            OAuthProvider.Google,
            window.location.origin + "/admin", // Redirect to admin on success (or home)
            window.location.origin + "/login"   // Redirect back to login on failure
        );
    };

    const logout = async () => {
        try {
            await account.deleteSession("current");
            setUser(null);
            setIsAdmin(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, login, loginWithGoogle, logout, verifying }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
