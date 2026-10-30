UPDATE traveler_trips
SET budget = 0
WHERE budget IS NULL;

ALTER TABLE traveler_trips
    MODIFY COLUMN start_date DATE NULL,
    MODIFY COLUMN end_date DATE NULL,
    MODIFY COLUMN visibility ENUM('friends', 'private', 'public') NOT NULL DEFAULT 'friends',
    MODIFY COLUMN budget DECIMAL(12,2) NOT NULL DEFAULT 0;
