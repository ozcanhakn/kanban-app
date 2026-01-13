/**
 * useBoards Hook
 * Manages the list of all boards with Supabase integration
 * Filters boards by user ownership, assignment, or organization membership
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, supabase } from '../lib/supabase';
import type { Board } from '../types/kanban';

// Extended board type with assignment info
interface BoardWithAssignment extends Board {
    hasAssignedCards?: boolean;
}

export function useBoards() {
    const { user, currentOrg } = useAuth();
    const [boards, setBoards] = useState<BoardWithAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch boards for current user
    const fetchBoards = useCallback(async () => {
        if (!user) {
            setBoards([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Build query based on context
            let query = db.boards().select('*');

            if (currentOrg) {
                // If in organization context, get org boards
                query = query.eq('org_id', currentOrg.id);
            } else {
                // Personal context: get user's own boards or boards assigned to user
                query = query.or(`owner_id.eq.${user.id},assigned_to.eq.${user.id}`);
            }

            const { data: boardsData, error: fetchError } = await query.order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Now check which boards have cards assigned to current user
            const boardsWithAssignment: BoardWithAssignment[] = [];

            for (const board of boardsData || []) {
                // Check if any card in this board is assigned to current user
                const { data: assignedCards } = await supabase
                    .from('cards')
                    .select('id')
                    .eq('assigned_to', user.id)
                    .in('column_id',
                        (await supabase.from('columns').select('id').eq('board_id', board.id)).data?.map(c => c.id) || []
                    )
                    .limit(1);

                boardsWithAssignment.push({
                    ...board,
                    hasAssignedCards: (assignedCards?.length ?? 0) > 0,
                    // Update board_type based on ownership and assignment
                    board_type: board.owner_id === user.id
                        ? 'personal'
                        : (assignedCards?.length ?? 0) > 0
                            ? 'assigned'
                            : board.board_type
                });
            }

            setBoards(boardsWithAssignment);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch boards');
            console.error('Error fetching boards:', err);
        } finally {
            setLoading(false);
        }
    }, [user, currentOrg]);

    // Initial fetch
    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('boards-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'boards' },
                () => {
                    fetchBoards();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cards' },
                () => {
                    // Also refresh when cards change (assignment might have changed)
                    fetchBoards();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchBoards]);

    // Create a new board
    const createBoard = useCallback(async (title: string, orgId?: string): Promise<Board | null> => {
        try {
            const insertData: { title: string; org_id?: string } = { title };
            if (orgId) {
                insertData.org_id = orgId;
            }

            const { data, error: createError } = await db.boards()
                .insert(insertData)
                .select()
                .single();

            if (createError) throw createError;

            // Create default columns for the new board
            if (data) {
                const defaultColumns = [
                    { board_id: data.id, title: 'To Do', position: 0 },
                    { board_id: data.id, title: 'In Progress', position: 1 },
                    { board_id: data.id, title: 'Done', position: 2 },
                ];

                await db.columns().insert(defaultColumns);
            }

            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create board');
            console.error('Error creating board:', err);
            return null;
        }
    }, []);

    // Delete a board
    const deleteBoard = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await db.boards()
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete board');
            console.error('Error deleting board:', err);
            return false;
        }
    }, []);

    // Update board title
    const updateBoard = useCallback(async (id: string, title: string): Promise<boolean> => {
        try {
            const { error: updateError } = await db.boards()
                .update({ title, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update board');
            console.error('Error updating board:', err);
            return false;
        }
    }, []);

    return {
        boards,
        loading,
        error,
        createBoard,
        deleteBoard,
        updateBoard,
        refetch: fetchBoards,
    };
}
