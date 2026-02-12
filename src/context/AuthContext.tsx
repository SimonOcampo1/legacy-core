import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { account, databases, DATABASE_ID, MEMBERS_COLLECTION_ID } from "../lib/appwrite";
import { OAuthProvider, Query } from "appwrite";
import type { Models } from "appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    isAdmin: boolean;
    isAuthorized: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => Promise<void>;
    checkUserStatus: () => Promise<void>;
    verifying: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const ADMIN_EMAIL = "ocamposimon1@gmail.com";

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkAuthorizaton = async (email: string) => {
        // Hardcoded admin is always authorized
        if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
            setIsAuthorized(true);
            setIsAdmin(true);
            return;
        }

        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [Query.equal('email', email.toLowerCase().trim())]
            );

            // Access based on the 'is_authorized' field (or 'isAuthorized' whichever we decide)
            // Let's go with 'is_authorized' to match common snake_case in DBs, 
            // but the user's request implied naming it isAuthorized. Let's use is_authorized for consistency with avatar_id etc.
            const memberDoc = response.documents[0];
            const isAuthorizedMember = memberDoc ? !!memberDoc.is_authorized : false;
            const isAdminMember = memberDoc ? memberDoc.role === "Admin" : false;

            setIsAuthorized(isAuthorizedMember);
            setIsAdmin(isAdminMember);
        } catch (error) {
            console.error("Error checking authorized members:", error);
            setIsAuthorized(false);
            setIsAdmin(false);
        }
    };

    const checkUserStatus = async () => {
        try {
            console.log("Checking Appwrite session...");
            const accountDetails = await account.get();
            console.log("Session found for:", accountDetails.email);
            setUser(accountDetails);
            await checkAuthorizaton(accountDetails.email);
        } catch (error) {
            console.log("No active Appwrite session or error fetching details:", error);
            setUser(null);
            setIsAdmin(false);
            setIsAuthorized(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setVerifying(true);
        try {
            console.log("Attempting email/password login for:", email);
            await account.createEmailPasswordSession(email, password);
            const accountDetails = await account.get();
            console.log("Login successful. User email:", accountDetails.email);
            setUser(accountDetails);
            await checkAuthorizaton(accountDetails.email);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setVerifying(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setVerifying(true);
        try {
            // 1. Create Appwrite Account
            const userId = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 36);
            await account.create(userId || 'unique()', email, password, name);

            // 2. Create Profile Document (Pending Authorization)
            // Using ID derived from email or unique() for the document
            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                userId || 'unique()',
                {
                    name,
                    email: email.toLowerCase().trim(),
                    is_authorized: false, // Default to false
                    role: "Member",
                    avatar_id: "",
                    bio: "New member awaiting authorization.",
                    created_at: new Date().toISOString()
                }
            );

            // 3. Log them in immediately
            await login(email, password);
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        } finally {
            setVerifying(false);
        }
    };

    const loginWithGoogle = () => {
        account.createOAuth2Session(
            OAuthProvider.Google,
            window.location.origin, // Redirect to home on success
            window.location.origin   // Redirect back to home on failure
        );
    };

    const logout = async () => {
        try {
            await account.deleteSession("current");
            setUser(null);
            setIsAdmin(false);
            setIsAuthorized(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAdmin,
            isAuthorized,
            login,
            register,
            loginWithGoogle,
            logout,
            checkUserStatus,
            verifying
        }}>
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
