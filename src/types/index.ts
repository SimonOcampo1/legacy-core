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
    description?: string;
    status: 'draft' | 'published' | 'archived';
    date_event?: string; // DateTime string
    tags?: string;
    author_id: string;
    author?: string; // Expanded field
    cover_image_id?: string;
    category?: string;
    likes?: number;
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
    author_name?: string;
    narrative_id: string;
    parent_id?: string;
    audio_url?: string;
    likes: number;
    liked_by?: string[]; // Array of user IDs who liked the comment
    replies?: Comment[];
}

export interface Group extends Models.Document {
    name: string;
    logo_url?: string;
    logo_svg?: string;
    logo_id?: string;
    join_code: string;
    owner_id: string;
    accent_color?: string; // Hex code
    members: string[]; // Array of User IDs
    description?: string;
}
