ALTER TABLE guide_profiles
    ADD COLUMN profile_photo_data MEDIUMBLOB NULL,
    ADD COLUMN profile_photo_mime_type VARCHAR(50) NULL;
