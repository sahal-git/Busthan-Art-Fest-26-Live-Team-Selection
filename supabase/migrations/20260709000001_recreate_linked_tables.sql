-- Recreate Categories Table
CREATE TABLE categories (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  bg TEXT NOT NULL,
  border TEXT NOT NULL,
  count INTEGER DEFAULT 0
);

-- Recreate Students Table
CREATE TABLE students (
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
