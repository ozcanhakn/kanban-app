/**
 * useBoard Hook
 * Manages a single board's data including columns and cards
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, supabase } from '../lib/supabase';
import type { Activity, Attachment, Board, Card, Column, ColumnWithCards, Comment, Label, Subtask } from '../types/kanban';

export function useBoard(boardId: string | null) {
    const { user, profile } = useAuth();
    const [board, setBoard] = useState<Board | null>(null);
    const [columns, setColumns] = useState<ColumnWithCards[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch board with all data
    const fetchBoard = useCallback(async () => {
        if (!boardId) {
            setBoard(null);
            setColumns([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch board
            const { data: boardData, error: boardError } = await db.boards()
                .select('*')
                .eq('id', boardId)
                .single();

            if (boardError) throw boardError;
            setBoard(boardData);

            // Fetch columns
            const { data: columnsData, error: columnsError } = await db.columns()
                .select('*')
                .eq('board_id', boardId)
                .order('position');

            if (columnsError) throw columnsError;

            // Fetch cards for all columns
            const columnIds = (columnsData || []).map((c: Column) => c.id);
            let cardsData: Card[] = [];
            let subtasksData: Subtask[] = [];
            let labelsData: Label[] = [];
            let cardLabelsData: { card_id: string; label_id: string }[] = [];
            let attachmentsData: Attachment[] = [];
            let commentsData: Comment[] = [];
            let activitiesData: Activity[] = [];

            if (columnIds.length > 0) {
                const { data: cards, error: cardsError } = await db.cards()
                    .select('*')
                    .in('column_id', columnIds)
                    .order('position');

                if (cardsError) throw cardsError;
                cardsData = cards || [];

                // Fetch subtasks and attachments for all cards
                const cardIds = cardsData.map((c) => c.id);
                if (cardIds.length > 0) {
                    const { data: subtasks } = await db.subtasks()
                        .select('*')
                        .in('card_id', cardIds)
                        .order('position');
                    subtasksData = subtasks || [];

                    const { data: attachments } = await db.attachments()
                        .select('*')
                        .in('card_id', cardIds)
                        .order('created_at', { ascending: false });
                    attachmentsData = attachments || [];

                    const { data: comments } = await db.comments()
                        .select('*')
                        .in('card_id', cardIds)
                        .order('created_at', { ascending: false });
                    commentsData = comments || [];

                    const { data: activities } = await db.activities()
                        .select('*')
                        .in('card_id', cardIds)
                        .order('created_at', { ascending: false });
                    activitiesData = activities || [];
                }

                // Fetch labels for this board
                const { data: labels } = await db.labels()
                    .select('*')
                    .eq('board_id', boardId);
                labelsData = labels || [];

                // Fetch card-label relationships
                if (cardIds.length > 0) {
                    const { data: cardLabels } = await db.cardLabels()
                        .select('*')
                        .in('card_id', cardIds);
                    cardLabelsData = cardLabels || [];
                }
            }

            // Combine columns with their cards, subtasks, labels, and attachments
            const columnsWithCards: ColumnWithCards[] = (columnsData || []).map((column: Column) => ({
                ...column,
                cards: cardsData
                    .filter((card) => card.column_id === column.id)
                    .map((card) => {
                        const cardLabelIds = cardLabelsData
                            .filter((cl) => cl.card_id === card.id)
                            .map((cl) => cl.label_id);
                        return {
                            ...card,
                            labels: labelsData.filter((l) => cardLabelIds.includes(l.id)),
                            subtasks: subtasksData.filter((s) => s.card_id === card.id),
                            attachments: attachmentsData.filter((a) => a.card_id === card.id),
                            comments: commentsData.filter((c) => c.card_id === card.id),
                            activities: activitiesData.filter((a) => a.card_id === card.id),
                        };
                    }),
            }));

            setColumns(columnsWithCards);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch board');
            console.error('Error fetching board:', err);
        } finally {
            setLoading(false);
        }
    }, [boardId]);

    // Initial fetch
    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    // Real-time subscriptions
    useEffect(() => {
        if (!boardId) return;

        const channel = supabase
            .channel(`board-${boardId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${boardId}` },
                () => fetchBoard()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cards' },
                () => fetchBoard()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'attachments' },
                () => fetchBoard()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'comments' },
                () => fetchBoard()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'activities' },
                () => fetchBoard()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [boardId, fetchBoard]);

    // Helper to log activities with real user info
    const logActivity = async (cardId: string, actionType: string, details: Record<string, unknown> = {}) => {
        try {
            // Add user name to details for display purposes
            const enrichedDetails = {
                ...details,
                userName: profile?.full_name || user?.email || 'Bilinmeyen Kullanıcı',
            };

            await db.activities().insert({
                board_id: boardId,
                card_id: cardId,
                action_type: actionType,
                details: enrichedDetails,
                user_id: user?.id || 'anonymous',
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    };

    // Add a new column
    const addColumn = useCallback(async (title: string): Promise<Column | null> => {
        if (!boardId) return null;

        try {
            const maxPosition = columns.length > 0
                ? Math.max(...columns.map((c) => c.position))
                : -1;

            const { data, error: insertError } = await db.columns()
                .insert({
                    board_id: boardId,
                    title,
                    position: maxPosition + 1,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Refresh board to get new column with cards array
            await fetchBoard();

            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add column');
            console.error('Error adding column:', err);
            return null;
        }
    }, [boardId, columns, fetchBoard]);

    // Update column
    const updateColumn = useCallback(async (columnId: string, title: string): Promise<boolean> => {
        try {
            const { error: updateError } = await db.columns()
                .update({ title })
                .eq('id', columnId);

            if (updateError) throw updateError;
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update column');
            console.error('Error updating column:', err);
            return false;
        }
    }, []);

    // Delete column
    const deleteColumn = useCallback(async (columnId: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await db.columns()
                .delete()
                .eq('id', columnId);

            if (deleteError) throw deleteError;
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete column');
            console.error('Error deleting column:', err);
            return false;
        }
    }, []);

    // Add a new card
    const addCard = useCallback(async (columnId: string, title: string): Promise<Card | null> => {
        try {
            const column = columns.find((c) => c.id === columnId);
            const maxPosition = column && column.cards.length > 0
                ? Math.max(...column.cards.map((c) => c.position))
                : -1;

            const { data, error: insertError } = await db.cards()
                .insert({
                    column_id: columnId,
                    title,
                    position: maxPosition + 1,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            await logActivity(data.id, 'create_card', { title });
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add card');
            console.error('Error adding card:', err);
            return null;
        }
    }, [columns, boardId]);

    // Update card
    const updateCard = useCallback(async (
        cardId: string,
        updates: Partial<Pick<Card, 'title' | 'description' | 'due_date' | 'priority'>>
    ): Promise<boolean> => {
        try {
            const { error: updateError } = await db.cards()
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', cardId);

            if (updateError) throw updateError;

            await logActivity(cardId, 'update_card', updates);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update card');
            console.error('Error updating card:', err);
            return false;
        }
    }, [boardId]);

    // Delete card
    const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await db.cards()
                .delete()
                .eq('id', cardId);

            if (deleteError) throw deleteError;
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete card');
            console.error('Error deleting card:', err);
            return false;
        }
    }, []);

    // Move card (arrow buttons)
    const moveCard = useCallback(async (
        cardId: string,
        targetColumnId: string,
        newPosition: number
    ): Promise<boolean> => {
        try {
            const { error: updateError } = await db.cards()
                .update({
                    column_id: targetColumnId,
                    position: newPosition,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', cardId);

            if (updateError) throw updateError;

            // Getting column names for log would be nice but requires looking up columns
            const fromCol = columns.find(c => c.cards.some(card => card.id === cardId));
            const toCol = columns.find(c => c.id === targetColumnId);

            if (fromCol && toCol && fromCol.id !== toCol.id) {
                await logActivity(cardId, 'move_card', {
                    fromColumn: fromCol.title,
                    toColumn: toCol.title
                });
            }

            // Refresh board to reflect changes in UI
            await fetchBoard();

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to move card');
            console.error('Error moving card:', err);
            return false;
        }
    }, [columns, boardId, fetchBoard]);

    // Reorder columns
    const reorderColumns = useCallback(async (
        columnId: string,
        newPosition: number
    ): Promise<boolean> => {
        try {
            const { error: updateError } = await db.columns()
                .update({ position: newPosition })
                .eq('id', columnId);

            if (updateError) throw updateError;
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder column');
            console.error('Error reordering column:', err);
            return false;
        }
    }, []);

    // Add a new comment
    const addComment = useCallback(async (cardId: string, content: string): Promise<void> => {
        try {
            const { error } = await db.comments().insert({
                card_id: cardId,
                content,
                user_id: 'current-user', // Replace with actual user ID
            });
            if (error) throw error;
            await logActivity(cardId, 'add_comment', { content });
            fetchBoard(); // Refresh board to show new comment
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add comment');
            console.error('Error adding comment:', error);
            throw error; // Re-throw to allow caller to handle
        }
    }, [boardId, fetchBoard]);

    // Delete comment
    const deleteComment = useCallback(async (commentId: string): Promise<void> => {
        try {
            const { error } = await db.comments().delete().eq('id', commentId);
            if (error) throw error;
            // Optionally log activity for comment deletion, if needed
            fetchBoard(); // Refresh board to reflect deletion
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete comment');
            console.error('Error deleting comment:', error);
            throw error; // Re-throw to allow caller to handle
        }
    }, [fetchBoard]);

    // Upload attachment
    const uploadAttachment = useCallback(async (cardId: string, file: File): Promise<boolean> => {
        try {
            // 1. Upload file to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const storagePath = `${cardId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('kanban-files')
                .upload(storagePath, file);

            if (uploadError) throw uploadError;

            // 2. Create Attachment record in DB
            const { error: dbError } = await db.attachments().insert({
                card_id: cardId,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                storage_path: storagePath,
            });

            if (dbError) throw dbError;

            await logActivity(cardId, 'upload_attachment', { fileName: file.name });
            fetchBoard(); // Refresh board to show new attachment
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload attachment');
            console.error('Error uploading attachment:', err);
            return false;
        }
    }, [boardId, fetchBoard]);

    // Delete attachment
    const deleteAttachment = useCallback(async (attachmentId: string, storagePath: string): Promise<boolean> => {
        try {
            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('kanban-files')
                .remove([storagePath]);

            if (storageError) throw storageError;

            // 2. Delete from DB
            const { error: dbError } = await db.attachments()
                .delete()
                .eq('id', attachmentId);

            if (dbError) throw dbError;

            await logActivity('', 'delete_attachment', {}); // Card ID might not be easily available here without fetching

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete attachment');
            console.error('Error deleting attachment:', err);
            return false;
        }
    }, [boardId]);

    // Toggle subtask & Automation
    const toggleSubtask = useCallback(async (subtaskId: string, isCompleted: boolean): Promise<{ automationMessage?: string }> => {
        try {
            // 1. Update subtask in DB
            const { error } = await db.subtasks()
                .update({ is_completed: isCompleted })
                .eq('id', subtaskId);

            if (error) throw error;

            // 2. Automation: Check if all subtasks are completed
            if (isCompleted) {
                // Find card and its subtasks from local state to avoid DB fetch if possible
                let cardId: string | null = null;
                let currentSubtasks: Subtask[] = [];

                for (const col of columns) {
                    for (const card of col.cards) {
                        const subtask = card.subtasks?.find(s => s.id === subtaskId);
                        if (subtask) {
                            cardId = card.id;
                            currentSubtasks = card.subtasks || [];
                            break;
                        }
                    }
                    if (cardId) break;
                }

                if (cardId && currentSubtasks.length > 0) {
                    // Check if ALL OTHER subtasks are also completed
                    // We assume the current one is now completed (optimistic)
                    const allOthersCompleted = currentSubtasks
                        .filter(s => s.id !== subtaskId)
                        .every(s => s.is_completed);

                    if (allOthersCompleted) {
                        // Find "Done" or "Tamamlandı" column
                        const doneColumn = columns.find(c =>
                            c.title.toLowerCase().includes('done') ||
                            c.title.toLowerCase().includes('tamam') ||
                            c.title.toLowerCase().includes('biten')
                        );

                        // Find current column
                        const currentColumn = columns.find(c => c.cards.some(card => card.id === cardId));

                        // Move if target exists and is different
                        if (doneColumn && currentColumn && doneColumn.id !== currentColumn.id) {
                            await moveCard(cardId, doneColumn.id, 0);
                            return { automationMessage: `Tüm görevler bitti! Kart "${doneColumn.title}" sütununa taşındı. 🚀` };
                        }
                    }
                }
            }

            fetchBoard();
            return {};
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to toggle subtask');
            console.error('Error toggling subtask:', error);
            return {};
        }
    }, [columns, moveCard, fetchBoard]);

    // Assign card to a user
    const assignCard = useCallback(async (cardId: string, userId: string | null): Promise<boolean> => {
        try {
            const { error: updateError } = await db.cards()
                .update({ assigned_to: userId })
                .eq('id', cardId);

            if (updateError) throw updateError;

            // Log activity
            await logActivity(cardId, 'card_assigned', { assigned_to: userId });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign card');
            console.error('Error assigning card:', err);
            return false;
        }
    }, [logActivity]);

    return {
        board,
        columns,
        loading,
        error,
        addColumn,
        updateColumn,
        deleteColumn,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        reorderColumns,
        refetch: fetchBoard,
        uploadAttachment,
        deleteAttachment,
        addComment,
        deleteComment,
        toggleSubtask,
        assignCard,
    };
}
