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
    socials?: {
        email?: boolean;
        linkedin?: boolean;
        twitter?: boolean;
    };
    narratives?: {
        id: string;
        date: string;
        title: string;
        excerpt: string;
    }[];
}
