export type MoodType = 'Happy' | 'Sad' | 'Angry' | 'Excited' | 'Loved' | 'Confused';

export interface Rant {
    id: string;
    created_at: string;
    content: string;
    mood: string;
    likes: number;
    anonymous_user_id: string;
    language: string;
    sentiment: string;
    is_optimistic?: boolean;
}

export interface Comment {
    id: number;
    created_at: string;
    rant_id: string;
    anonymous_user_id: string;
    content: string;
}

export interface LikeLog {
    id: string;
    rant_id: string;
    anonymous_user_id: string;
    created_at: string;
}
