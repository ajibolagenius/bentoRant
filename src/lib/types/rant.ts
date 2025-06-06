import { MoodType } from '../utils/mood';

export interface Rant {
    id: string;
    content: string;
    mood: MoodType;
    likes: number;
    created_at: string;
    comments: number;
    userAlias: string;
    isLiked?: boolean;
    anonymous_user_id: string;
    is_optimistic?: boolean;
}
