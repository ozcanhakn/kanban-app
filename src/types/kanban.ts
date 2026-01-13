/**
 * Kanban Board Type Definitions - V2
 * Extended interfaces for professional Kanban application
 * Includes: Priority, Subtasks, WIP Limits, Board Templates, Labels
 */

// ===========================
// Priority Levels
// ===========================

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  low: { label: 'Düşük', color: '#22c55e', icon: '↓' },
  medium: { label: 'Orta', color: '#3b82f6', icon: '→' },
  high: { label: 'Yüksek', color: '#f59e0b', icon: '↑' },
  critical: { label: 'Kritik', color: '#ef4444', icon: '🔥' },
};

// ===========================
// Subtasks
// ===========================

export interface Subtask {
  id: string;
  card_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

// ===========================
// Core Entities
// ===========================

/** Represents a single task card */
export interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null;
  priority: Priority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

/** Represents a column/list in the board */
export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  wip_limit: number | null;
  created_at: string;
}

/** Represents a Kanban board */
export interface Board {
  id: string;
  title: string;
  owner_id: string;
  org_id: string | null;
  assigned_to: string | null;
  board_type: 'personal' | 'assigned';
  created_at: string;
  updated_at: string;
}

/** Represents a label/tag for cards */
export interface Label {
  id: string;
  board_id: string;
  text: string;
  color: string;
}

// ===========================
// Board Templates
// ===========================

export interface ColumnConfig {
  title: string;
  wip_limit: number | null;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string | null;
  columns_config: ColumnConfig[];
  is_default: boolean;
  created_at: string;
}

// ===========================
// Card-Label Relationship
// ===========================

export interface CardLabel {
  card_id: string;
  label_id: string;
}

// ===========================
// Attachments
// ===========================

export interface Attachment {
  id: string;
  card_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

// ===========================
// Comments & Activities
// ===========================

export interface Comment {
  id: string;
  card_id: string;
  content: string;
  created_at: string;
  user_id?: string;
}

export type ActionType =
  | 'create_card'
  | 'move_card'
  | 'update_card'
  | 'delete_card'
  | 'add_comment'
  | 'upload_attachment'
  | 'delete_attachment'
  | 'add_subtask'
  | 'toggle_subtask';

export interface Activity {
  id: string;
  card_id: string | null;
  board_id: string;
  action_type: ActionType;
  details: any;
  created_at: string;
  user_id?: string;
}

// ===========================
// Extended Types
// ===========================

/** Card with its associated labels and subtasks */
export interface CardWithLabels extends Card {
  labels: Label[];
  subtasks?: Subtask[];
  attachments?: Attachment[];
  comments?: Comment[];
  activities?: Activity[];
}

/** Column with its cards */
export interface ColumnWithCards extends Column {
  cards: CardWithLabels[];
}

/** Full board data with columns, cards, and labels */
export interface BoardWithData extends Board {
  columns: ColumnWithCards[];
  labels: Label[];
}

// ===========================
// Filter Types
// ===========================

export type DateFilter = 'all' | 'today' | 'week' | 'overdue' | 'no-date';

export interface FilterState {
  searchQuery: string;
  labels: string[];
  priorities: Priority[];
  dateFilter: DateFilter;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: '',
  labels: [],
  priorities: [],
  dateFilter: 'all',
};

// ===========================
// Drag and Drop
// ===========================

export type DragItemType = 'card' | 'column';

export interface DragItem {
  type: DragItemType;
  id: string;
  columnId?: string;
}

// ===========================
// UI State
// ===========================

export type Theme = 'dark' | 'light';

export interface ModalState {
  isOpen: boolean;
  cardId: string | null;
}

// ===========================
// Default Label Colors
// ===========================

export const DEFAULT_LABEL_COLORS = [
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];
