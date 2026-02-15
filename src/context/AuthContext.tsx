import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { account, databases, DATABASE_ID, MEMBERS_COLLECTION_ID } from "../lib/appwrite";
import { OAuthProvider, Query } from "appwrite";
import type { Models } from "appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isApproved: boolean;
    isAuthorized: boolean; // Kept for legacy compatibility, maps to isApproved
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
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const ADMIN_EMAIL = "ocamposimon1@gmail.com";

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkAuthorizaton = async (email: string, userId: string, name: string) => {
        // Hardcoded superadmin check
        const isHardcodedAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [Query.equal('email', email.toLowerCase().trim())]
            );

            if (response.documents.length === 0) {
                console.log("No profile found for logged in user. Creating new profile...");
                try {
                    // Create Profile Document if it doesn't exist (Lazy Reg for Google Auth)
                    await databases.createDocument(
                        DATABASE_ID,
                        MEMBERS_COLLECTION_ID,
                        userId,
                        {
                            name: name || "New Member",
                            email: email.toLowerCase().trim(),
                            is_authorized: isHardcodedAdmin, // Admins auto-authorized
                            is_approved: isHardcodedAdmin,
                            is_superadmin: isHardcodedAdmin,
                            role: isHardcodedAdmin ? "Admin" : "Member",
                            avatar_id: "",
                            bio: "New member joined via Google.",
                            created_at: new Date().toISOString(),
                            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'member'
                        }
                    );

                    // Set default permissions for the new profile so the user can edit it
                    await databases.updateDocument(
                        DATABASE_ID,
                        MEMBERS_COLLECTION_ID,
                        userId,
                        {},
                        ["read(\"any\")", `update("user:${userId}")`, `delete("user:${userId}")`]
                    );

                    console.log("Profile created for:", email);
                    // Re-fetch to confirm and set state
                    return checkAuthorizaton(email, userId, name);
                } catch (createError) {
                    console.error("Error creating profile for OAuth user:", createError);
                }
                return;
            }

            const memberDoc = response.documents[0];

            // Logic: 
            // isSuperAdmin: Hardcoded email OR db flag
            // isAdmin: Role is 'Admin' OR isSuperAdmin
            // isApproved: db flag 'is_approved' OR isSuperAdmin

            const dbSuperAdmin = memberDoc.is_superadmin || false;
            const effectiveSuperAdmin = isHardcodedAdmin || dbSuperAdmin;

            const dbApproved = memberDoc.is_approved || memberDoc.is_authorized || false; // Fallback to is_authorized for backward compat
            const effectiveApproved = effectiveSuperAdmin || dbApproved;

            const dbAdmin = memberDoc.role === "Admin";
            const effectiveAdmin = effectiveSuperAdmin || dbAdmin;

            setIsSuperAdmin(effectiveSuperAdmin);
            setIsApproved(effectiveApproved);
            setIsAdmin(effectiveAdmin);
            // Legacy mapping
            setIsAuthorized(effectiveApproved);

        } catch (error) {
            console.error("Error checking authorized members:", error);
            setIsAuthorized(false);
            setIsAdmin(false);
            setIsApproved(false);
            setIsSuperAdmin(false);
        }
    };

    const checkUserStatus = async () => {
        try {
            console.log("Checking Appwrite session...");
            const accountDetails = await account.get();
            console.log("Session found for:", accountDetails.email);
            setUser(accountDetails);
            await checkAuthorizaton(accountDetails.email, accountDetails.$id, accountDetails.name);
        } catch (error) {
            console.log("No active Appwrite session or error fetching details:", error);
            setUser(null);
            setIsAdmin(false);
            setIsAuthorized(false);
            setIsApproved(false);
            setIsSuperAdmin(false);
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
            await checkAuthorizaton(accountDetails.email, accountDetails.$id, accountDetails.name);
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
            const isHardcodedAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                userId || 'unique()',
                {
                    name,
                    email: email.toLowerCase().trim(),
                    is_authorized: isHardcodedAdmin,
                    is_approved: isHardcodedAdmin,
                    is_superadmin: isHardcodedAdmin,
                    role: isHardcodedAdmin ? "Admin" : "Member",
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
            setIsApproved(false);
            setIsSuperAdmin(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAdmin,
            isSuperAdmin,
            isApproved,
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
