import { useState, useEffect } from "react";
import { databases, DATABASE_ID, MEMBERS_COLLECTION_ID } from "../../lib/appwrite";
import { ID, Query } from "appwrite";
import { UserPlus, Trash2, Mail, Shield, AlertCircle, Loader2 } from "lucide-react";
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
        <div className="space-y-16">
            {/* 1. Pending Approvals Section */}
            {pendingMembers.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                            <Shield className="w-5 h-5 text-amber-500" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        </div>
                        <h2 className="text-2xl font-serif italic text-charcoal dark:text-white">Pending Approval</h2>
                    </div>

                    <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 overflow-hidden">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-amber-100 dark:divide-amber-900/20">
                                {pendingMembers.map((member) => (
                                    <tr key={member.$id} className="group transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-charcoal dark:text-stone-200">{member.name}</span>
                                                <span className="text-xs text-stone-500">{member.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-xs text-stone-400">
                                            Registered {new Date(member.addedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    disabled={!!isProcessing}
                                                    onClick={() => handleApproval(member.$id, true)}
                                                    className="px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#C5A059] hover:bg-[#C5A059] hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={!!isProcessing}
                                                    onClick={() => handleApproval(member.$id, false)}
                                                    className="px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    Deny
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* 2. Add New Member (Pre-authorization) */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <UserPlus className="w-5 h-5 text-[#C5A059]" />
                    <h2 className="text-2xl font-serif italic text-charcoal dark:text-white">Pre-authorize Email</h2>
                </div>
                <p className="text-stone-500 dark:text-stone-400 font-light max-w-lg mb-8 text-sm leading-relaxed">
                    Authorize a trusted collaborator before they create their account. They will gain access immediately upon their first login.
                </p>

                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                    <div className="relative flex-1 group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[#C5A059] transition-colors" />
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all"
                            required
                        />
                    </div>
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Name (Optional)"
                            className="w-full bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding || !newEmail}
                        className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-8 py-4 rounded-2xl text-sm font-semibold hover:bg-charcoal/90 dark:hover:bg-stone-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        <span>Authorize</span>
                    </button>
                </form>
            </section>

            {/* 3. Authorized Members List */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-5 h-5 text-stone-400" />
                    <h2 className="text-2xl font-serif italic text-charcoal dark:text-white">Community Directory</h2>
                </div>

                <div className="bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-stone-200" /></div>
                    ) : members.length === 0 ? (
                        <div className="p-12 text-center text-stone-400">
                            <AlertCircle className="w-8 h-8 mx-auto mb-4 opacity-10" />
                            <p className="font-serif italic font-light">No authorized members in the directory.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-stone-50 dark:border-stone-800/50">
                                        <th className="px-8 py-5 text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">Member</th>
                                        <th className="px-8 py-5 text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">Email</th>
                                        <th className="px-8 py-5 text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">Joined</th>
                                        <th className="px-8 py-5 text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
                                    {members.map((member) => (
                                        <motion.tr key={member.$id} className="group hover:bg-stone-50/30 dark:hover:bg-stone-800/20 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[#C5A059] font-serif italic text-sm">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-charcoal dark:text-stone-300">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-stone-500 italic font-newsreader">{member.email}</td>
                                            <td className="px-8 py-5 text-xs text-stone-400">{new Date(member.addedAt).toLocaleDateString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleDeleteMember(member)}
                                                    className="p-2 text-stone-200 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <ConfirmationModal
                isOpen={!!deletingMember}
                onClose={() => setDeletingMember(null)}
                onConfirm={confirmDelete}
                title="Remove Authorization"
                message={`Are you sure you want to remove ${deletingMember?.name} from the authorized group? This will revoke their access to the Administrative Core.`}
            />
        </div>
    );
}
