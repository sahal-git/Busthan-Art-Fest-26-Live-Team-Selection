-- Recreate Categories Table
CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  bg TEXT NOT NULL,
  border TEXT NOT NULL,
  count INTEGER DEFAULT 0
);

-- Insert dummy categories to satisfy existing event_state rows before constraint is added
INSERT INTO categories (name, color, bg, border) VALUES 
  ('Ula', 'text-white', 'bg-white/10', 'border-white/20'),
  ('BIDAYA', 'text-blue-400', 'bg-blue-400/10', 'border-blue-400/20'),
  ('THANIYA', 'text-green-400', 'bg-green-400/10', 'border-green-400/20'),
  ('ALIYA', 'text-purple-400', 'bg-purple-400/10', 'border-purple-400/20'),
  ('Senior', 'text-event-gold', 'bg-event-gold/10', 'border-event-gold/20')
ON CONFLICT DO NOTHING;

-- Recreate Students Table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "chestNo" TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT,
  class TEXT NOT NULL,
  photo TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  "selectedBy" TEXT REFERENCES teams(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Add foreign key back to event_state
ALTER TABLE event_state
  DROP CONSTRAINT IF EXISTS fk_current_category;

ALTER TABLE event_state
  ADD CONSTRAINT fk_current_category FOREIGN KEY ("currentCategory") REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Re-enable Realtime
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table categories;
