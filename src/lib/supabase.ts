/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

/**
 * Type-safe database helper for common operations
 */
export const db = {
    boards: () => supabase.from('boards'),
    columns: () => supabase.from('columns'),
    cards: () => supabase.from('cards'),
    labels: () => supabase.from('labels'),
    cardLabels: () => supabase.from('card_labels'),
    subtasks: () => supabase.from('subtasks'),
    boardTemplates: () => supabase.from('board_templates'),
    attachments: () => supabase.from('attachments'),
    comments: () => supabase.from('comments'),
    activities: () => supabase.from('activities'),
};

