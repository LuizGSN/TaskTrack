CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'completed')),
  CONSTRAINT tasks_priority_check CHECK (priority IN ('normal', 'urgent'))
);

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_priority_check'
  ) THEN
    ALTER TABLE tasks
    ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('normal', 'urgent'));
  END IF;
END $$;
