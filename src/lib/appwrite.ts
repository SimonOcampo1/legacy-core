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
export const AUDIO_BUCKET_ID = "audio_comments";
