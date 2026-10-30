CREATE DATABASE IF NOT EXISTS venturevista;
USE venturevista;


-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('traveler', 'guide', 'admin') NOT NULL DEFAULT 'traveler',
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. TRAVELER PROFILES TABLE
CREATE TABLE IF NOT EXISTS traveler_profiles (
    user_id BIGINT UNSIGNED NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    telephone_number VARCHAR(20) NOT NULL,
    email VARCHAR(254) NOT NULL,
    travel_preferences LONGTEXT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_traveler_email (email),
    CONSTRAINT fk_traveler_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. GUIDE PROFILES TABLE
CREATE TABLE IF NOT EXISTS guide_profiles (
    user_id BIGINT UNSIGNED NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    profile_photo_path VARCHAR(500) NULL,
    profile_photo_data MEDIUMBLOB NULL,
    profile_photo_mime_type VARCHAR(50) NULL,
    contact_number VARCHAR(20) NOT NULL,
    location VARCHAR(150) NOT NULL,
    years_experience INT UNSIGNED DEFAULT 0,
    daily_charge_lkr DECIMAL(10,2) UNSIGNED NOT NULL,
    sltda_license_number VARCHAR(100) NOT NULL,
    short_bio VARCHAR(500) NOT NULL,
    languages LONGTEXT NULL,
    verification_status
        ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verification_notes VARCHAR(1000) NULL,
    verified_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_guide_license (sltda_license_number),
    CONSTRAINT fk_guide_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4. TRAVELER TRIPS TABLE
CREATE TABLE IF NOT EXISTS traveler_trips (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    traveler_id BIGINT UNSIGNED NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    visibility ENUM('friends', 'private', 'public') NOT NULL DEFAULT 'friends',
    budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    activities JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'planned',
    PRIMARY KEY (id),
    KEY idx_trip_traveler (traveler_id),
    CONSTRAINT fk_trip_traveler
        FOREIGN KEY (traveler_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    trip_id BIGINT UNSIGNED NOT NULL,
    traveler_id BIGINT UNSIGNED NOT NULL,
    guide_id BIGINT UNSIGNED NOT NULL,
    offered_budget DECIMAL(12,2) DEFAULT 0.00,
    counter_offer DECIMAL(12,2) NULL,
    request_message TEXT NULL,
    status ENUM('pending', 'countered', 'accepted', 'rejected')
        DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_booking_trip (trip_id),
    KEY idx_booking_traveler (traveler_id),
    KEY idx_booking_guide (guide_id),
    CONSTRAINT fk_booking_trip
        FOREIGN KEY (trip_id) REFERENCES traveler_trips(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_traveler
        FOREIGN KEY (traveler_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_guide
        FOREIGN KEY (guide_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 6. BOOKING MESSAGES TABLE
CREATE TABLE IF NOT EXISTS booking_messages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_message_booking (booking_id),
    KEY idx_message_sender (sender_id),
    CONSTRAINT fk_message_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 7. PERMISSION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS permission_requests (
    id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NULL,
    account_type VARCHAR(50) NULL,
    account_email VARCHAR(255) NULL,
    request_type VARCHAR(100) NOT NULL,
    `reference` VARCHAR(255) NULL,
    description TEXT NULL,
    context TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
