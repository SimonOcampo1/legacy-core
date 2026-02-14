import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    throw new Error('Appwrite environment variables are missing');
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = "698d041600384323f75a";
export const NARRATIVES_COLLECTION_ID = "narratives";
export const TIMELINE_COLLECTION_ID = "timeline";
export const PROFILES_COLLECTION_ID = "profiles";
export const GALLERY_COLLECTION_ID = "gallery";
export const COMMENTS_COLLECTION_ID = "comments";
export const MEMBERS_COLLECTION_ID = "profiles";
export const AUDIO_BUCKET_ID = "audio_comments";
export const BUCKET_ID = "legacy_core_assets";

/**
 * Generates a displayable image URL from an Appwrite file ID or existing URL.
 * Returns a placeholder if the imageId is empty/missing.
 */
export function getImageUrl(imageId: string | undefined | null): string {
    if (!imageId) return "https://placehold.co/400x400/111/333?text=NO+IMAGE";

    // If already a full URL, return as-is
    if (imageId.startsWith("http")) return imageId;

    // Generate Appwrite file view URL (no server-side transform needed)
    try {
        return storage.getFileView(BUCKET_ID, imageId).toString();
    } catch (e) {
        console.error("Error generating image URL for", imageId, e);
        return "https://placehold.co/400x400/111/333?text=ERROR";
    }
}
