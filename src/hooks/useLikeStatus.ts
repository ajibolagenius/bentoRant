import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSecureAuthorId } from '@/utils/security';
import { secureStorage } from '@/utils/security';

export function useLikeStatus(rantId: string) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Function to update like status
    const setLikeStatus = async (liked: boolean): Promise<void> => {
        const authorId = getSecureAuthorId();

        if (liked) {
            // Add like to database
            await supabase
                .from('likes')
                .insert({
                    rant_id: rantId,
                    anonymous_user_id: authorId
                });

            // Update local state
            setIsLiked(true);
            setLikeCount(prev => prev + 1);

            // Store in secure storage
            try {
                // Get current liked rants
                const likedRantsStr = secureStorage.getItem('liked_rants');
                let likedRantsArray = [];

                // Try to parse if it exists and looks like JSON
                if (likedRantsStr && likedRantsStr.trim().startsWith('[')) {
                    try {
                        likedRantsArray = JSON.parse(likedRantsStr);
                    } catch (e) {
                        console.warn('Failed to parse liked_rants, creating new array');
                        likedRantsArray = [];
                    }
                }

                // Add the new rant ID if not already present
                if (!likedRantsArray.includes(rantId)) {
                    likedRantsArray.push(rantId);
                    secureStorage.setItem('liked_rants', JSON.stringify(likedRantsArray));
                }
            } catch (error) {
                console.error('Error updating liked rants in storage:', error);
            }
        } else {
            // Remove like from database
            await supabase
                .from('likes')
                .delete()
                .eq('rant_id', rantId)
                .eq('anonymous_user_id', authorId);

            // Update local state
            setIsLiked(false);
            setLikeCount(prev => Math.max(0, prev - 1));

            // Update secure storage
            try {
                const likedRantsStr = secureStorage.getItem('liked_rants');
                if (likedRantsStr && likedRantsStr.trim().startsWith('[')) {
                    try {
                        const likedRantsArray = JSON.parse(likedRantsStr);
                        const updatedLikes = likedRantsArray.filter((id: string) => id !== rantId);
                        secureStorage.setItem('liked_rants', JSON.stringify(updatedLikes));
                    } catch (e) {
                        console.warn('Failed to parse liked_rants for removal, skipping update');
                    }
                }
            } catch (error) {
                console.error('Error updating liked rants in storage:', error);
            }
        }
    };

    useEffect(() => {
        async function checkLikeStatus() {
            setIsLoading(true);
            const authorId = getSecureAuthorId();

            // Try to get from secure storage first for faster response
            let cachedIsLiked = false;
            try {
                const likedRantsStr = secureStorage.getItem('liked_rants');

                // Only try to parse if it looks like JSON (starts with '[')
                if (likedRantsStr && likedRantsStr.trim().startsWith('[')) {
                    try {
                        const likedRantsArray = JSON.parse(likedRantsStr);
                        cachedIsLiked = Array.isArray(likedRantsArray) && likedRantsArray.includes(rantId);
                    } catch (error) {
                        console.error('Error parsing liked rants from storage:', error);
                        // If parsing fails, we'll reset the storage
                        secureStorage.setItem('liked_rants', JSON.stringify([]));
                    }
                } else if (likedRantsStr && !likedRantsStr.trim().startsWith('[')) {
                    // If it doesn't look like JSON, reset it
                    console.warn('liked_rants is not in JSON format, resetting');
                    secureStorage.setItem('liked_rants', JSON.stringify([]));
                }
            } catch (error) {
                console.error('Error checking liked status from storage:', error);
            }

            // Set initial state from cache
            setIsLiked(cachedIsLiked);

            // Check if the current user has liked this rant from database
            try {
                const { data: likeData, error: likeError } = await supabase
                    .from('likes')
                    .select('*')
                    .eq('rant_id', rantId)
                    .eq('anonymous_user_id', authorId)
                    .maybeSingle(); // Use maybeSingle to handle no rows gracefully

                if (likeError) {
                    console.error('Error fetching like status:', likeError);
                    return;
                }

                const { count, error: countError } = await supabase
                    .from('likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('rant_id', rantId); // Removed unnecessary headers

                if (countError) {
                    console.error('Error fetching like count:', countError);
                    return;
                }

                const serverIsLiked = !!likeData;
                setIsLiked(serverIsLiked);
                setLikeCount(count || 0);

                // Update secure storage if different from server
                if (cachedIsLiked !== serverIsLiked) {
                    try {
                        const likedRantsStr = secureStorage.getItem('liked_rants');
                        let likedRantsArray = [];

                        if (likedRantsStr && likedRantsStr.trim().startsWith('[')) {
                            likedRantsArray = JSON.parse(likedRantsStr);
                        }

                        if (serverIsLiked) {
                            likedRantsArray.push(rantId);
                        } else {
                            likedRantsArray = likedRantsArray.filter(id => id !== rantId);
                        }

                        secureStorage.setItem('liked_rants', JSON.stringify(likedRantsArray));
                    } catch (storageError) {
                        console.error('Error updating secure storage:', storageError);
                    }
                }
            } catch (error) {
                console.error('Unexpected error checking like status:', error);
            } finally {
                setIsLoading(false);
            }
        }

        checkLikeStatus();
    }, [rantId]);

    return { isLiked, likeCount, isLoading, setLikeStatus };
}
