import { useState, useEffect } from "react";
import { databases, DATABASE_ID, MEMBERS_COLLECTION_ID } from "../../lib/appwrite";
import { ID, Query } from "appwrite";
import { UserPlus, Trash2, Mail, Shield, AlertCircle, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ConfirmationModal } from "../ui/ConfirmationModal";

interface Member {
    $id: string;
    email: string;
    name: string;
    is_authorized: boolean;
    addedAt: string;
}

export function MemberManager() {
    const [members, setMembers] = useState<Member[]>([]);
    const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [Query.orderDesc("$createdAt")]
            );

            const allMembers: Member[] = response.documents.map(doc => ({
                $id: doc.$id,
                email: doc.email,
                name: doc.name || "Anonymous",
                is_authorized: !!doc.is_authorized,
                addedAt: doc.$createdAt
            }));

            setMembers(allMembers.filter(m => m.is_authorized));
            setPendingMembers(allMembers.filter(m => !m.is_authorized));
        } catch (error: any) {
            console.error("Error fetching members:", error);
            if (error.code === 404) {
                toast.error("Profiles collection not found. Please verify Appwrite IDs.");
            } else {
                toast.error("Failed to load members");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = newEmail.toLowerCase().trim();

        if (!email) return;
        if (members.some(m => m.email === email)) {
            toast.error("This email is already authorized");
            return;
        }

        setIsAdding(true);
        try {
            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                ID.unique(),
                {
                    email,
                    name: newName || email.split('@')[0],
                    is_authorized: true, // Admin-added users are pre-authorized
                    role: "Member",
                    created_at: new Date().toISOString()
                }
            );
            setNewEmail("");
            setNewName("");
            toast.success("Member authorized successfully");
            fetchMembers();
        } catch (error: any) {
            console.error("Error adding member:", error);
            toast.error(`Failed to authorize member: ${error.message || 'Unknown error'}`);
        } finally {
            setIsAdding(false);
        }
    };

    const handleApproval = async (id: string, approve: boolean) => {
        setIsProcessing(id);
        try {
            if (approve) {
                await databases.updateDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, id, {
                    is_authorized: true
                });
                toast.success("Member approved successfully");
            } else {
                await databases.deleteDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, id);
                toast.success("Request denied and removed");
            }
            fetchMembers();
        } catch (error: any) {
            console.error("Error processing member:", error);
            toast.error(`Failed to process request: ${error.message || 'Unknown error'}`);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDeleteMember = async (member: Member) => {
        setDeletingMember(member);
    };

    const confirmDelete = async () => {
        if (!deletingMember) return;
        try {
            await databases.deleteDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, deletingMember.$id);
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
                    <div className="text-4xl font-black text-[#C5A059]">
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
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="ENTER_EMAIL_ADDRESS..."
                            className="w-full p-3 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black transition-colors"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="DESIGNATION_NAME (OPTIONAL)..."
                            className="w-full p-3 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding || !newEmail}
                        className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-[#C5A059] hover:text-black dark:hover:bg-[#C5A059] transition-colors disabled:opacity-50"
                    >
                        {isAdding ? "PROCESSING..." : "AUTHORIZE"}
                    </button>
                </form>
            </div>

            {/* Combined Table */}
            <div className="border border-black dark:border-white overflow-hidden">
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
                                    {member.is_authorized ? (
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
                                        {!member.is_authorized ? (
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
                {[...pendingMembers, ...members].length === 0 && (
                    <div className="p-12 text-center font-mono text-sm uppercase text-gray-500">
                        NO_PERSONNEL_RECORDS_FOUND
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!deletingMember}
                onClose={() => setDeletingMember(null)}
                onConfirm={confirmDelete}
                title="REVOKE ACCESS"
                message={`PERMANENTLY REVOKE ACCESS FOR [${deletingMember?.name}]?`}
                confirmText="CONFIRM_REVOCATION"
                variant="danger"
            />
        </div>
    );
}
