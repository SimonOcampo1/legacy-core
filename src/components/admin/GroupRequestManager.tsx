import { useState, useEffect } from "react";
import { databases, DATABASE_ID, GROUPS_COLLECTION_ID, GROUP_REQUESTS_COLLECTION_ID } from "../../lib/appwrite";
import { ID, Query } from "appwrite";
import { CheckCircle, XCircle, TerminalSquare } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { EmptyState } from "../ui/EmptyState";

interface GroupRequest {
    $id: string;
    name: string;
    logo_svg: string;
    logo_id?: string;
    logo_url?: string;
    accent_color: string;
    requester_id: string;
    status: 'pending' | 'approved' | 'rejected';
    $createdAt: string;
}

export const GroupRequestManager = () => {
    const [requests, setRequests] = useState<GroupRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                GROUP_REQUESTS_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            setRequests(response.documents as unknown as GroupRequest[]);
        } catch (error) {
            console.error("Error fetching group requests:", error);
            toast.error("Failed to load group requests.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (request: GroupRequest, approved: boolean) => {
        setIsProcessing(request.$id);
        try {
            if (approved) {
                // 1. Create the Group
                const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                await databases.createDocument(
                    DATABASE_ID,
                    GROUPS_COLLECTION_ID,
                    ID.unique(),
                    {
                        name: request.name,
                        accent_color: request.accent_color,
                        logo_svg: request.logo_svg,
                        logo_id: request.logo_id,
                        logo_url: request.logo_url,
                        join_code: joinCode,
                        owner_id: request.requester_id,
                        members: [request.requester_id]
                    }
                );
            }

            // 2. Update Request Status
            await databases.updateDocument(
                DATABASE_ID,
                GROUP_REQUESTS_COLLECTION_ID,
                request.$id,
                {
                    status: approved ? 'approved' : 'rejected'
                }
            );

            toast.success(approved ? "Group approved & created" : "Group request rejected");
            fetchRequests();

        } catch (error: any) {
            console.error("Error processing request:", error);
            toast.error(`Operation failed: ${error.message}`);
        } finally {
            setIsProcessing(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const processedRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="max-w-7xl mx-auto p-0 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b-2 border-black dark:border-white pb-6">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter">
                        UNIT_REQUESTS
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        // EXPANSION_CONTROL
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="border border-black dark:border-white p-6 bg-white dark:bg-black">
                    <div className="font-mono text-xs uppercase opacity-50 mb-2">PENDING_REVIEW</div>
                    <div className="text-4xl font-black text-gold">{pendingRequests.length}</div>
                </div>
                <div className="border border-black dark:border-white p-6 bg-white dark:bg-black">
                    <div className="font-mono text-xs uppercase opacity-50 mb-2">TOTAL_PROCESSED</div>
                    <div className="text-4xl font-black">{processedRequests.length}</div>
                </div>
            </div>

            {/* Pending Requests Table */}
            <div className="border border-black dark:border-white overflow-hidden min-h-[200px] relative mb-12">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full" />
                    </div>
                )}
                <div className="bg-black text-white dark:bg-white dark:text-black px-6 py-4 font-mono text-xs uppercase tracking-widest">
                    PENDING_QUEUE
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5">
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-black/10 dark:border-white/10">UNIT_ID</th>
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-black/10 dark:border-white/10">REQUESTER</th>
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-black/10 dark:border-white/10">TIMESTAMP</th>
                            <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-b border-black/10 dark:border-white/10 text-right">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                        {pendingRequests.map((req) => (
                            <motion.tr
                                key={req.$id}
                                className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 flex items-center justify-center rounded-none font-bold text-xs uppercase text-white"
                                            style={{ backgroundColor: req.accent_color || '#000' }}
                                        >
                                            {req.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold uppercase text-sm">{req.name}</div>
                                            <div className="font-mono text-[10px] text-gray-500">ID: {req.$id.substring(0, 6)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{req.requester_id}</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {new Date(req.$createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleApproval(req, true)}
                                            disabled={!!isProcessing}
                                            className="p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                            title="Approve"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleApproval(req, false)}
                                            disabled={!!isProcessing}
                                            className="p-2 border border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                            title="Reject"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {pendingRequests.length === 0 && !isLoading && (
                    <EmptyState
                        title="REQUEST_VOID"
                        message="NO PENDING GROUP REQUESTS IN THE QUEUE. THE NETWORK IS STABLE."
                        icon={TerminalSquare}
                        actionLabel="[ REFRESH_SYSTEM ]"
                        onAction={fetchRequests}
                    />
                )}
            </div>

            {/* History Table */}
            <div className="border border-black dark:border-white overflow-hidden min-h-[200px] relative opacity-60 hover:opacity-100 transition-opacity">
                <div className="bg-gray-100 dark:bg-zinc-900 px-6 py-4 font-mono text-xs uppercase tracking-widest text-gray-500 border-b border-black dark:border-white">
                    REQUEST_LOGS
                </div>
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                        {processedRequests.map((req) => (
                            <tr key={req.$id} className="text-gray-500">
                                <td className="px-6 py-3 font-mono text-xs">{req.name}</td>
                                <td className="px-6 py-3 font-mono text-xs">{req.requester_id}</td>
                                <td className="px-6 py-3 font-mono text-xs text-right uppercase">
                                    <span className={req.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                                        {req.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {processedRequests.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-6 text-center font-mono text-xs uppercase text-gray-500">
                                    LOGS_EMPTY
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
