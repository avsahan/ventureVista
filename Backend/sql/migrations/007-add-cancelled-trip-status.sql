UPDATE traveler_trips
SET status = 'planning'
WHERE status IS NULL OR status = '';

ALTER TABLE traveler_trips
    MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'planning';
