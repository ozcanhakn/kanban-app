-- Kanban Board Database Schema
-- Run this SQL in Supabase SQL Editor (supabase.com/dashboard -> SQL Editor)

-- ===========================
-- TABLES
-- ===========================

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns table
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1'
);

-- Card-Label junction table
CREATE TABLE IF NOT EXISTS card_labels (
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- ===========================
-- INDEXES
-- ===========================

CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(position);
CREATE INDEX IF NOT EXISTS idx_cards_column_id ON cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
CREATE INDEX IF NOT EXISTS idx_labels_board_id ON labels(board_id);

-- ===========================
-- ROW LEVEL SECURITY (Optional - for multi-user)
-- ===========================

-- Enable RLS (uncomment if you want to restrict access)
-- ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;

-- For now, allow all access (no authentication required)
-- This is suitable for personal/demo use

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all access to boards" ON boards;
DROP POLICY IF EXISTS "Allow all access to columns" ON columns;
DROP POLICY IF EXISTS "Allow all access to cards" ON cards;
DROP POLICY IF EXISTS "Allow all access to labels" ON labels;
DROP POLICY IF EXISTS "Allow all access to card_labels" ON card_labels;

-- Create new policies
CREATE POLICY "Allow all access to boards" ON boards FOR ALL USING (true);
CREATE POLICY "Allow all access to columns" ON columns FOR ALL USING (true);
CREATE POLICY "Allow all access to cards" ON cards FOR ALL USING (true);
CREATE POLICY "Allow all access to labels" ON labels FOR ALL USING (true);
CREATE POLICY "Allow all access to card_labels" ON card_labels FOR ALL USING (true);

-- ===========================
-- REALTIME
-- ===========================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE boards;
ALTER PUBLICATION supabase_realtime ADD TABLE columns;
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE labels;
ALTER PUBLICATION supabase_realtime ADD TABLE card_labels;
