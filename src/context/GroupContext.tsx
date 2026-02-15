import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { databases, DATABASE_ID, GROUPS_COLLECTION_ID, GROUP_REQUESTS_COLLECTION_ID, account, storage, BUCKET_ID, getImageUrl } from '../lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Group } from '../types';

interface GroupContextType {
    currentGroup: Group | null;
    allGroups: Group[];
    isLoading: boolean;
    switchGroup: (groupId: string) => void;
    refreshGroups: () => Promise<void>;
    createGroup: (name: string, accentColor?: string, logoSvg?: string, logoFile?: File) => Promise<Group>;
    requestGroup: (name: string, accentColor?: string, logoSvg?: string, logoFile?: File) => Promise<void>;
    joinGroup: (code: string) => Promise<void>;
    updateGroup: (groupId: string, data: { name?: string; accent_color?: string; logo_svg?: string; logo_file?: File }) => Promise<Group>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
    const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const user = await account.get();
            const response = await databases.listDocuments(
                DATABASE_ID,
                GROUPS_COLLECTION_ID,
                []
            );

            // Client-side filtering as per comment
            const groups = (response.documents as unknown as Group[]).filter(g =>
                g.members && g.members.includes(user.$id)
            );

            setAllGroups(groups);

            // Restore selection or default
            const savedGroupId = localStorage.getItem('legacy_core_group_id');
            const found = groups.find(g => g.$id === savedGroupId);

            if (found) {
                setCurrentGroup(found);
            } else if (groups.length > 0) {
                setCurrentGroup(groups[0]);
            } else {
                setCurrentGroup(null);
            }

        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Update CSS Variable when currentGroup changes
    useEffect(() => {
        const root = document.documentElement;
        if (currentGroup?.accent_color) {
            root.style.setProperty('--accent-color', currentGroup.accent_color);
        } else {
            root.style.setProperty('--accent-color', '#C5A059'); // Default Gold
        }
    }, [currentGroup]);

    useEffect(() => {
        if (currentGroup) {
            localStorage.setItem('legacy_core_group_id', currentGroup.$id);
        }
    }, [currentGroup]);

    const switchGroup = (groupId: string) => {
        const group = allGroups.find(g => g.$id === groupId);
        if (group) setCurrentGroup(group);
    };

    const requestGroup = async (name: string, accentColor: string = '#C5A059', logoSvg?: string, logoFile?: File) => {
        const user = await account.get();

        const data: Record<string, any> = {
            name,
            accent_color: accentColor,
            logo_svg: logoSvg || '',
            requester_id: user.$id,
            status: 'pending'
        };

        if (logoFile) {
            const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), logoFile);
            data.logo_id = uploadedFile.$id;
            data.logo_url = getImageUrl(uploadedFile.$id);
        }

        await databases.createDocument(
            DATABASE_ID,
            GROUP_REQUESTS_COLLECTION_ID,
            ID.unique(),
            data
        );
    };

    const createGroup = async (name: string, accentColor: string = '#C5A059', logoSvg?: string, logoFile?: File) => {
        const user = await account.get();
        // Generate random 6 char code
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const data: Record<string, any> = {
            name,
            accent_color: accentColor,
            logo_svg: logoSvg,
            join_code: joinCode,
            owner_id: user.$id,
            members: [user.$id]
        };

        if (logoFile) {
            const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), logoFile);
            data.logo_id = uploadedFile.$id;
            data.logo_url = getImageUrl(uploadedFile.$id);
        }

        const newGroup = await databases.createDocument(
            DATABASE_ID,
            GROUPS_COLLECTION_ID,
            ID.unique(),
            data
        );

        await fetchGroups();
        switchGroup(newGroup.$id);
        return newGroup as unknown as Group;
    };

    const joinGroup = async (code: string) => {
        // Logic to find group by code and add user to members
        // 1. Find group
        const list = await databases.listDocuments(
            DATABASE_ID,
            GROUPS_COLLECTION_ID,
            [Query.equal('join_code', code)]
        );

        if (list.documents.length === 0) throw new Error("Invalid Code");

        const group = list.documents[0] as unknown as Group;
        const user = await account.get();

        if (group.members.includes(user.$id)) {
            // Already joined
            switchGroup(group.$id);
            return;
        }

        // 2. Update group members
        await databases.updateDocument(
            DATABASE_ID,
            GROUPS_COLLECTION_ID,
            group.$id,
            {
                members: [...group.members, user.$id]
            }
        );

        await fetchGroups();
        switchGroup(group.$id);
    };

    const updateGroup = async (groupId: string, data: { name?: string; accent_color?: string; logo_svg?: string; logo_file?: File }) => {
        try {
            const updatePayload: Record<string, any> = { ...data };
            delete updatePayload.logo_file;

            if (data.logo_file) {
                const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), data.logo_file);
                updatePayload.logo_id = uploadedFile.$id;
                updatePayload.logo_url = getImageUrl(uploadedFile.$id);
            }

            const updatedGroup = await databases.updateDocument(
                DATABASE_ID,
                GROUPS_COLLECTION_ID,
                groupId,
                updatePayload
            );

            // Update local state
            setAllGroups(prev => prev.map(g => g.$id === groupId ? { ...g, ...updatePayload } : g));
            if (currentGroup?.$id === groupId) {
                setCurrentGroup(prev => prev ? { ...prev, ...updatePayload } : null);
            }

            return updatedGroup as unknown as Group;
        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    };

    return (
        <GroupContext.Provider value={{
            currentGroup,
            allGroups,
            isLoading,
            switchGroup,
            refreshGroups: fetchGroups,
            createGroup,
            requestGroup,
            joinGroup,
            updateGroup
        }}>
            {children}
        </GroupContext.Provider>
    );
}

export const useGroup = () => {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroup must be used within a GroupProvider');
    }
    return context;
};
