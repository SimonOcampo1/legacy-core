export interface Member {
    id: string;
    name: string;
    role: string;
    quote: string;
    imageUrl: string;
    // Extended profile fields
    bio?: string;
    bioIntro?: string; // The "Currently..." quote
    honors?: string[];
    social?: {
        email?: string;
        linkedin?: string;
        twitter?: string;
    };
    narratives?: {
        id: string;
        date: string;
        title: string;
        excerpt: string;
    }[];
}

import type { Models } from "appwrite";


export interface Narrative extends Models.Document {
    title: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    date_event?: string; // DateTime string
    tags?: string;
    author_id: string;
    author?: string; // Expanded field
    cover_image_id?: string;
}

export interface TimelineEvent extends Models.Document {
    title: string;
    description: string;
    date_event: string;
    location: string;
    image_id?: string;
    year?: string;
    attendee_image_urls?: string[]; // Array of strings (URLs)
}

export interface GalleryItem extends Models.Document {
    title: string;
    display_date: string;
    image_id: string; // URL or File ID
    sort_date: string; // ISO Date for sorting
}

export interface Comment extends Models.Document {
    content: string;
    author_id: string;
    narrative_id: string;
    parent_id?: string;
    audio_url?: string;
    likes: number;
    replies?: Comment[];
}
