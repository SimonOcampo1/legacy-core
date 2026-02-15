import { useState, useEffect } from "react";
import { databases, DATABASE_ID, PROFILES_COLLECTION_ID, getImageUrl } from "../../lib/appwrite";
import { ID, Query } from "appwrite";
import { UserPlus, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { EmptyState } from "../ui/EmptyState";
import { Users } from "lucide-react";

interface Member {
    $id: string;
    email: string;
    name: string;
    is_authorized: boolean;
    addedAt: string;
    role: 'member' | 'admin';
    status: 'active' | 'pending' | 'blocked';
    avatarUrl?: string;
    joinedAt: string;
}

export const MemberManager = ({ groupId }: { groupId?: string }) => {
    // const { user } = useAuth(); // Unused
    const [members, setMembers] = useState<Member[]>([]);
    const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);

    // Invite Form State
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (groupId) {
            fetchMembers();
        }
    }, [groupId]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const queries = [Query.orderDesc('$createdAt')];
            if (groupId) {
                queries.push(Query.equal('groups', groupId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                PROFILES_COLLECTION_ID,
                queries
            );

            const fetchedMembers = response.documents.map((doc: any) => ({
                $id: doc.$id,
                email: doc.email,
                name: doc.name,
                is_authorized: doc.is_authorized || false,
                addedAt: doc.$createdAt,
                role: doc.role || 'member',
                status: doc.status || 'active',
                avatarUrl: doc.avatar_id ? getImageUrl(doc.avatar_id) : undefined,
                joinedAt: doc.$createdAt
            })) as Member[];

            setMembers(fetchedMembers.filter(m => m.status === 'active'));
            setPendingMembers(fetchedMembers.filter(m => m.status === 'pending'));

        } catch (error: any) {
            console.error("Error fetching members:", error);
            toast.error("Failed to load member directory.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        if (!groupId) {
            toast.error("No group selected.");
            return;
        }

        setIsAdding(true);
        try {
            await databases.createDocument(
                DATABASE_ID,
                PROFILES_COLLECTION_ID,
                ID.unique(),
                {
                    name: inviteName,
                    email: inviteEmail,
                    role: inviteRole,
                    status: 'pending',
                    groups: [groupId],
                    bio: 'Invited Member',
                    slug: inviteName.toLowerCase().replace(/\s+/g, '-'),
                    is_authorized: false
                }
            );

            toast.success(`Invitation initiated to ${inviteEmail}`);
            setInviteEmail('');
            setInviteName('');
            fetchMembers();
        } catch (error: any) {
            console.error("Invite failed:", error);
            toast.error(`Failed to invite: ${error.message || 'Unknown error'}`);
        } finally {
            setIsAdding(false);
        }
    };

    const handleApproval = async (memberId: string, approved: boolean) => {
        setIsProcessing(memberId);
        try {
            await databases.updateDocument(
                DATABASE_ID,
                PROFILES_COLLECTION_ID,
                memberId,
                {
                    status: approved ? 'active' : 'blocked',
                    is_authorized: approved
                }
            );
            toast.success(approved ? "Member approved" : "Member request denied");
            fetchMembers();
        } catch (error: any) {
            console.error("Error updating member status:", error);
            toast.error("Failed to update member status");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDeleteMember = (member: Member) => {
        setDeletingMember(member);
    };

    const confirmDelete = async () => {
        if (!deletingMember) return;
        try {
            await databases.deleteDocument(DATABASE_ID, PROFILES_COLLECTION_ID, deletingMember.$id);
            toast.success("Authorization removed");
            setMembers(members.filter(m => m.$id !== deletingMember.$id));
            setDeletingMember(null);
        } catch (error: any) {
            console.error("Error deleting member:", error);
            toast.error(`Failed to remove authorization: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-0 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b-2 border-black dark:border-white pb-6">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter">
                        PERSONNEL_DB
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        // MEMBER_ACCESS_CONTROL
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="border border-black dark:border-white p-6 bg-white dark:bg-black">
                    <div className="font-mono text-xs uppercase opacity-50 mb-2">TOTAL_RECORDS</div>
                    <div className="text-4xl font-black">{members.length + pendingMembers.length}</div>
                </div>
                <div className="border border-black dark:border-white p-6 bg-white dark:bg-black">
                    <div className="font-mono text-xs uppercase opacity-50 mb-2">PENDING_AUTH</div>
                    <div className="text-4xl font-black text-gold">
                        {pendingMembers.length}
                    </div>
                </div>
                <div className="border border-black dark:border-white p-6 bg-white dark:bg-black">
                    <div className="font-mono text-xs uppercase opacity-50 mb-2">ACTIVE_UNITS</div>
                    <div className="text-4xl font-black">
                        {members.length}
                    </div>
                </div>
            </div>

            {/* Add New Member "Terminal" */}
            <div className="mb-12 border border-black dark:border-white p-6 bg-gray-50 dark:bg-white/5">
                <h3 className="font-mono text-xs uppercase mb-4 font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    INITIATE_NEW_AUTHORIZATION
                </h3>
                <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="ENTER_EMAIL_ADDRESS..."
                            className="w-full p-3 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black transition-colors"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            placeholder="DESIGNATION_NAME (OPTIONAL)..."
                            className="w-full p-3 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black transition-colors"
                        />
                    </div>
                    <div className="flex-1">
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                            className="w-full p-3 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black transition-colors appearance-none uppercase"
                        >
                            <option value="member">MEMBER</option>
                            <option value="admin">ADMIN</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding || !inviteEmail}
                        className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-gold hover:text-black dark:hover:bg-gold transition-colors disabled:opacity-50"
                    >
                        {isAdding ? "PROCESSING..." : "AUTHORIZE"}
                    </button>
                </form>
            </div >

            {/* Combined Table */}
            < div className="border border-black dark:border-white overflow-hidden min-h-[200px] relative" >
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full" />
                    </div>
                )}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white dark:bg-white dark:text-black">
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-white/20 dark:border-black/20">IDENTITY</th>
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-white/20 dark:border-black/20">CONTACT</th>
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-white/20 dark:border-black/20">STATUS</th>
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-white/20 dark:border-black/20 text-right">CONTROLS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black dark:divide-white">
                        {[...pendingMembers, ...members].map((member) => (
                            <motion.tr
                                key={member.$id}
                                className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center font-bold text-xs uppercase">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold uppercase text-sm">{member.name}</div>
                                            <div className="font-mono text-[10px] text-gray-500">ID: {member.$id.substring(0, 6)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-sm">{member.email}</td>
                                <td className="px-6 py-4">
                                    {member.status === 'active' ? (
                                        <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 font-mono text-[10px] uppercase">
                                            AUTHORIZED
                                        </span>
                                    ) : (
                                        <span className="border border-black dark:border-white px-2 py-1 font-mono text-[10px] uppercase text-gray-500 animate-pulse">
                                            PENDING
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {member.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApproval(member.$id, true)}
                                                    disabled={isProcessing === member.$id}
                                                    className="p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                                    title="Approve"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(member.$id, false)}
                                                    disabled={isProcessing === member.$id}
                                                    className="p-2 border border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                                    title="Deny"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteMember(member)}
                                                className="p-2 border border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                                title="Revoke"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {[...pendingMembers, ...members].length === 0 && !isLoading && (
                    <EmptyState
                        title="PERSONNEL_VOID"
                        message="NO AUTHORIZED PERSONNEL DETECTED IN THE DATABASE. INITIALIZE SECURITY PROTOCOLS."
                        icon={Users}
                        actionLabel="[ REFRESH_DIRECTORY ]"
                        onAction={fetchMembers}
                    />
                )}
            </div >

            <ConfirmationModal
                isOpen={!!deletingMember}
                onClose={() => setDeletingMember(null)}
                onConfirm={confirmDelete}
                title="REVOKE ACCESS"
                message={`PERMANENTLY REVOKE ACCESS FOR [${deletingMember?.name}]?`}
                confirmText="CONFIRM_REVOCATION"
                variant="danger"
            />
        </div >
    );
};
