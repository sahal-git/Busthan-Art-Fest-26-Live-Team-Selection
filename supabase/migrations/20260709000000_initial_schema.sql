-- 1. Create Teams Table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "loginCode" TEXT NOT NULL
);

-- 2. Create Students Table
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "chestNo" TEXT NOT NULL,
  category TEXT NOT NULL,
  class TEXT NOT NULL,
  photo TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  "selectedBy" TEXT REFERENCES teams(id)
);

-- 3. Create Event State Table (Single Row)
CREATE TABLE event_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  "currentCategory" TEXT NOT NULL DEFAULT 'Senior',
  "currentTeam" TEXT REFERENCES teams(id),
  "accessEnabled" BOOLEAN DEFAULT false,
  "timerTimeRemaining" INTEGER DEFAULT 24,
  "timerIsRunning" BOOLEAN DEFAULT false,
  "audioMasterVolume" INTEGER DEFAULT 80,
  "audioEffectsVolume" INTEGER DEFAULT 100,
  "audioCountdownVolume" INTEGER DEFAULT 60,
  "audioCelebrationVolume" INTEGER DEFAULT 100,
  "audioMuted" BOOLEAN DEFAULT false
);

-- Initialize the single row
INSERT INTO event_state (id, "currentCategory") VALUES (1, 'Senior');

-- 4. Create Latest Selections Table
CREATE TABLE latest_selections (
  id BIGINT PRIMARY KEY,
  "studentName" TEXT NOT NULL,
  "teamId" TEXT REFERENCES teams(id),
  time TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Categories Table
CREATE TABLE categories (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  bg TEXT NOT NULL,
  border TEXT NOT NULL,
  count INTEGER DEFAULT 0
);

-- Enable Realtime for all tables
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table event_state;
alter publication supabase_realtime add table latest_selections;
