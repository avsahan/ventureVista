-- Migration 005: Create permission_requests table
-- Run this script against the venturevista database.

CREATE TABLE IF NOT EXISTS permission_requests (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Requester personal info (may be a guest with no account)
    full_name   VARCHAR(150)  NOT NULL,
    email       VARCHAR(254)  NOT NULL,
    phone       VARCHAR(30)   NULL,

    -- Account type selected on the form
    account_type ENUM('traveler', 'guide', 'other') NOT NULL DEFAULT 'other',

    -- Email linked to an existing account (may differ from contact email)
    account_email VARCHAR(254) NULL,

    -- Request classification
    request_type ENUM(
        'Local guide registration',
        'Trip or itinerary access',
        'Profile or account change',
        'Other request'
    ) NOT NULL,

    -- Optional link to a specific trip / booking reference
    reference   VARCHAR(255)  NULL,

    -- Free-text explanation of what is needed
    description TEXT          NOT NULL,

    -- Any extra context the requester chose to provide
    context     TEXT          NULL,

    -- Admin review outcome
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',

    -- Optional notes left by the admin when approving / rejecting
    admin_notes VARCHAR(1000) NULL,

    -- Who reviewed the request (FK to users table, nullable because reviewer may not always be a system user)
    reviewed_by BIGINT UNSIGNED NULL,

    reviewed_at DATETIME      NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_perm_req_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Index to speed up common admin queries
CREATE INDEX IF NOT EXISTS idx_perm_req_status    ON permission_requests(status);
CREATE INDEX IF NOT EXISTS idx_perm_req_email     ON permission_requests(email);
CREATE INDEX IF NOT EXISTS idx_perm_req_created   ON permission_requests(created_at DESC);
