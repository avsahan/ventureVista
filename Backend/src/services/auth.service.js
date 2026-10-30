
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ========================================
// HELPER: CHECK EMAIL
// ========================================
async function checkEmailExists(connection, email) {
  const [rows] = await connection.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows.length > 0;
}

async function getTableColumns(executor, tableName) {
  const [columns] = await executor.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return new Set(columns.map((column) => column.Field));
}

async function insertRecord(connection, tableName, record) {
  const columns = Object.keys(record);
  const placeholders = columns.map(() => "?").join(", ");
  const columnNames = columns.map((column) => `\`${column}\``).join(", ");

  return connection.execute(
    `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`,
    Object.values(record)
  );
}

function makeUserRecord(columns, data, passwordHash, role) {
  const record = { email: data.email, role };

  if (columns.has("name")) record.name = data.fullName;
  if (columns.has("full_name")) record.full_name = data.fullName;
  if (columns.has("password_hash")) record.password_hash = passwordHash;
  if (columns.has("password")) record.password = passwordHash;

  return record;
}

// ========================================
// REGISTER TRAVELER
// ========================================
async function registerTraveler(data) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const emailExists = await checkEmailExists(
      connection,
      data.email
    );

    if (emailExists) {
      const error = new Error("Email is already registered");
      error.status = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    const userColumns = await getTableColumns(connection, "users");
    const [result] = await insertRecord(
      connection,
      "users",
      makeUserRecord(userColumns, data, passwordHash, "traveler")
    );

    const userId = result.insertId;
    const profileColumns = await getTableColumns(connection, "traveler_profiles");
    const profileRecord = { user_id: userId };

    if (profileColumns.has("full_name")) profileRecord.full_name = data.fullName;
    if (profileColumns.has("telephone_number")) profileRecord.telephone_number = data.telephoneNumber;
    if (profileColumns.has("email")) profileRecord.email = data.email;
    if (profileColumns.has("country")) profileRecord.country = data.country;
    if (profileColumns.has("travel_interests")) {
      profileRecord.travel_interests = JSON.stringify(data.travelInterests || []);
    }
    if (profileColumns.has("travel_preferences")) {
      profileRecord.travel_preferences = JSON.stringify({
        country: data.country,
        interests: data.travelInterests || []
      });
    }

    await insertRecord(connection, "traveler_profiles", profileRecord);

    await connection.commit();

    return {
      id: userId,
      name: data.fullName,
      fullName: data.fullName,
      email: data.email,
      role: "traveler",
      country: data.country,
      telephoneNumber: data.telephoneNumber,
      travelInterests: data.travelInterests || []
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ========================================
// REGISTER GUIDE
// ========================================
async function registerGuide(data) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const emailExists = await checkEmailExists(
      connection,
      data.email
    );

    if (emailExists) {
      const error = new Error("Email is already registered");
      error.status = 409;
      throw error;
    }

    const [licenseRows] = await connection.execute(
      "SELECT user_id FROM guide_profiles WHERE sltda_license_number = ? LIMIT 1",
      [data.sltdaLicenseNumber]
    );

    if (licenseRows.length > 0) {
      const error = new Error("SLTDA license number is already registered");
      error.status = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    const userColumns = await getTableColumns(connection, "users");
    const [result] = await insertRecord(
      connection,
      "users",
      makeUserRecord(userColumns, data, passwordHash, "guide")
    );

    const userId = result.insertId;
    const profileColumns = await getTableColumns(connection, "guide_profiles");
    const profileRecord = { user_id: userId };
    const guideValues = {
      full_name: data.fullName,
      contact_number: data.telephoneNumber,
      location: data.baseLocation,
      years_experience: data.yearsExperience,
      daily_charge_lkr: data.dailyRateLkr,
      short_bio: data.shortBio,
      languages: JSON.stringify(data.languages),
      sltda_license_number: data.sltdaLicenseNumber,
      verification_status: "pending"
    };

    if (data.profilePhoto) {
      if (!profileColumns.has("profile_photo_data") || !profileColumns.has("profile_photo_mime_type")) {
        const error = new Error("Guide photo storage is not configured. Apply migration 003-add-guide-profile-photo.sql.");
        error.status = 503;
        throw error;
      }
      guideValues.profile_photo_data = data.profilePhoto.data;
      guideValues.profile_photo_mime_type = data.profilePhoto.mimeType;
    }

    for (const [column, value] of Object.entries(guideValues)) {
      if (profileColumns.has(column)) profileRecord[column] = value;
    }

    await insertRecord(connection, "guide_profiles", profileRecord);

    await connection.commit();

    return {
      id: userId,
      name: data.fullName,
      fullName: data.fullName,
      email: data.email,
      role: "guide",
      verificationStatus: "pending",
      profilePhotoPath: data.profilePhoto ? `/api/v1/auth/guides/${userId}/photo` : ""
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateGuideProfile(userId, data) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userColumns = await getTableColumns(connection, "users");
    const guideColumns = await getTableColumns(connection, "guide_profiles");
    const userNameColumn = userColumns.has("full_name") ? "full_name" : "name";
    const requiredGuideColumns = [
      "contact_number",
      "location",
      "years_experience",
      "daily_charge_lkr",
      "short_bio",
      "languages",
      "sltda_license_number",
    ];

    if (!userColumns.has(userNameColumn) || requiredGuideColumns.some((column) => !guideColumns.has(column))) {
      const error = new Error("Guide profile storage is incomplete. Check the guide_profiles database schema.");
      error.status = 503;
      throw error;
    }

    const [users] = await connection.execute(
      "SELECT role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (!users.length || users[0].role !== "guide") {
      const error = new Error("Guide account required");
      error.status = 403;
      throw error;
    }

    const [profiles] = await connection.execute(
      "SELECT sltda_license_number FROM guide_profiles WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (!profiles.length) {
      const error = new Error("Guide profile not found");
      error.status = 404;
      throw error;
    }

    const [duplicateLicenses] = await connection.execute(
      "SELECT user_id FROM guide_profiles WHERE sltda_license_number = ? AND user_id <> ? LIMIT 1",
      [data.sltdaLicenseNumber, userId]
    );
    if (duplicateLicenses.length) {
      const error = new Error("SLTDA license number is already registered");
      error.status = 409;
      throw error;
    }

    if (data.profilePhoto && (
      !guideColumns.has("profile_photo_data") ||
      !guideColumns.has("profile_photo_mime_type")
    )) {
      const error = new Error("Guide photo storage is not configured. Apply migration 003-add-guide-profile-photo.sql.");
      error.status = 503;
      throw error;
    }

    await connection.execute(
      `UPDATE users SET \`${userNameColumn}\` = ? WHERE id = ?`,
      [data.fullName, userId]
    );

    const updates = {
      full_name: data.fullName,
      contact_number: data.telephoneNumber,
      location: data.baseLocation,
      years_experience: data.yearsExperience,
      daily_charge_lkr: data.dailyRateLkr,
      short_bio: data.shortBio,
      languages: JSON.stringify(data.languages),
      sltda_license_number: data.sltdaLicenseNumber,
    };
    const licenseChanged = profiles[0].sltda_license_number !== data.sltdaLicenseNumber;
    if (licenseChanged && guideColumns.has("verification_status")) {
      updates.verification_status = "pending";
      if (guideColumns.has("verification_notes")) updates.verification_notes = null;
      if (guideColumns.has("verified_at")) updates.verified_at = null;
    }
    if (data.profilePhoto) {
      updates.profile_photo_data = data.profilePhoto.data;
      updates.profile_photo_mime_type = data.profilePhoto.mimeType;
    }

    const fields = Object.entries(updates).filter(([column]) => guideColumns.has(column));
    await connection.execute(
      `UPDATE guide_profiles SET ${fields.map(([column]) => `\`${column}\` = ?`).join(", ")} WHERE user_id = ?`,
      [...fields.map(([, value]) => value), userId]
    );

    await connection.commit();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("Guide profile was updated but could not be loaded.");
    }
    return user;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ========================================
// LOGIN
// ========================================
async function login(email, password) {
  const userColumns = await getTableColumns(db, "users");
  const nameColumn = userColumns.has("full_name") ? "full_name" : "name";
  const passwordColumn = userColumns.has("password_hash") ? "password_hash" : "password";
  const statusColumn = userColumns.has("status") ? ", status" : "";
  const [rows] = await db.execute(
    `SELECT id, ${nameColumn} AS full_name, email, ${passwordColumn} AS password_hash, role${statusColumn}
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  const user = rows[0];

  if (
    !user ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return {
    id: user.id,
    name: user.full_name,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status
  };
}

// ========================================
// GET CURRENT USER BY ID
// ========================================
async function getUserById(id) {
  const userColumns = await getTableColumns(db, "users");
  const profileColumns = await getTableColumns(db, "traveler_profiles");
  const guideColumns = await getTableColumns(db, "guide_profiles");
  const nameColumn = userColumns.has("full_name") ? "full_name" : "name";
  const statusColumn = userColumns.has("status") ? "u.status" : "NULL AS status";
  const createdAtColumn = userColumns.has("created_at")
    ? "u.created_at"
    : "NULL AS created_at";
  const telephoneColumn = profileColumns.has("telephone_number")
    ? "tp.telephone_number"
    : "NULL AS telephone_number";
  const countryColumn = profileColumns.has("country")
    ? "tp.country"
    : "NULL AS country";
  const interestsColumn = profileColumns.has("travel_interests")
    ? "tp.travel_interests"
    : profileColumns.has("travel_preferences")
      ? "tp.travel_preferences"
      : "NULL AS travel_interests";
  const guideColumn = (column, alias) => guideColumns.has(column)
    ? `gp.${column} AS ${alias}`
    : `NULL AS ${alias}`;
  const guidePhotoColumn = guideColumns.has("profile_photo_data")
    ? "gp.profile_photo_data IS NOT NULL AS guide_has_photo"
    : "0 AS guide_has_photo";

  const [rows] = await db.execute(
    `SELECT u.id, u.${nameColumn} AS full_name, u.email, u.role,
            ${statusColumn}, ${createdAtColumn}, ${telephoneColumn},
            ${countryColumn}, ${interestsColumn},
            ${guideColumn("contact_number", "guide_telephone_number")},
            ${guideColumn("location", "guide_location")},
            ${guideColumn("years_experience", "guide_years_experience")},
            ${guideColumn("daily_charge_lkr", "guide_daily_rate_lkr")},
            ${guideColumn("sltda_license_number", "guide_license_number")},
            ${guideColumn("short_bio", "guide_short_bio")},
            ${guideColumn("languages", "guide_languages")},
            ${guideColumn("verification_status", "guide_verification_status")},
            ${guideColumn("profile_photo_path", "guide_photo_path")},
            ${guidePhotoColumn}
     FROM users u
     LEFT JOIN traveler_profiles tp ON tp.user_id = u.id
     LEFT JOIN guide_profiles gp ON gp.user_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];

  return {
    id: user.id,
    name: user.full_name,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    ...(user.role === "traveler" ? (() => {
      const storedInterests = user.travel_interests
        ? (typeof user.travel_interests === "string"
          ? JSON.parse(user.travel_interests)
          : user.travel_interests)
        : [];
      const preferences = Array.isArray(storedInterests)
        ? { interests: storedInterests }
        : storedInterests;

      return {
        telephoneNumber: user.telephone_number || "",
        country: user.country || preferences.country || "",
        travelInterests: preferences.interests || []
      };
    })() : user.role === "guide" ? {
      telephoneNumber: user.guide_telephone_number || "",
      baseLocation: user.guide_location || "",
      yearsExperience: Number(user.guide_years_experience) || 0,
      dailyRateLkr: Number(user.guide_daily_rate_lkr) || 0,
      sltdaLicenseNumber: user.guide_license_number || "",
      shortBio: user.guide_short_bio || "",
      languages: user.guide_languages
        ? (typeof user.guide_languages === "string"
          ? JSON.parse(user.guide_languages)
          : user.guide_languages)
        : [],
      verificationStatus: user.guide_verification_status || "pending",
      profilePhotoPath: user.guide_has_photo
        ? `/api/v1/auth/guides/${user.id}/photo`
        : user.guide_photo_path || ""
    } : {})
  };
}

async function listGuides() {
  const userColumns = await getTableColumns(db, "users");
  const guideColumns = await getTableColumns(db, "guide_profiles");
  const userNameColumn = userColumns.has("full_name") ? "u.full_name" : "u.name";
  const guideNameColumn = guideColumns.has("full_name")
    ? "gp.full_name"
    : userNameColumn;
  const locationColumn = guideColumns.has("location") ? "gp.location" : "NULL";
  const priceColumn = guideColumns.has("daily_charge_lkr") ? "gp.daily_charge_lkr" : "NULL";
  const bioColumn = guideColumns.has("short_bio") ? "gp.short_bio" : "NULL";
  const statusColumn = guideColumns.has("verification_status")
    ? "gp.verification_status"
    : "'pending'";
  const languagesColumn = guideColumns.has("languages") ? "gp.languages" : "NULL";
  const photoColumn = guideColumns.has("profile_photo_data")
    ? "gp.profile_photo_data IS NOT NULL"
    : "0";
  const [rows] = await db.execute(
    `SELECT u.id, ${guideNameColumn} AS full_name, ${locationColumn} AS location,
            ${priceColumn} AS daily_rate_lkr, ${bioColumn} AS short_bio,
            ${statusColumn} AS verification_status, ${languagesColumn} AS languages,
            ${photoColumn} AS has_profile_photo
     FROM users u
     INNER JOIN guide_profiles gp ON gp.user_id = u.id
     WHERE u.role = 'guide'
     ORDER BY u.id DESC`
  );

  return rows.map((guide) => ({
    id: guide.id,
    name: guide.full_name,
    location: guide.location ? `${guide.location}, Sri Lanka` : 'Sri Lanka',
    specialty: 'Local experiences',
    description: guide.short_bio || `Discover local experiences with ${guide.full_name}.`,
    price: Number(guide.daily_rate_lkr) || 0,
    rating: null,
    image: guide.has_profile_photo
      ? `/api/v1/auth/guides/${guide.id}/photo`
      : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85',
    verificationStatus: guide.verification_status || 'pending',
    languages: guide.languages
      ? (typeof guide.languages === 'string' ? JSON.parse(guide.languages) : guide.languages)
      : []
  }));
}

async function getGuidePhoto(id) {
  if (!/^\d+$/.test(String(id))) return null;

  const columns = await getTableColumns(db, "guide_profiles");
  if (!columns.has("profile_photo_data") || !columns.has("profile_photo_mime_type")) {
    return null;
  }

  const [rows] = await db.execute(
    `SELECT profile_photo_data AS data, profile_photo_mime_type AS mime_type
     FROM guide_profiles
     WHERE user_id = ? AND profile_photo_data IS NOT NULL
     LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  return { data: rows[0].data, mimeType: rows[0].mime_type };
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
module.exports = {
  registerTraveler,
  registerGuide,
  updateGuideProfile,
  login,
  getUserById,
  listGuides,
  getGuidePhoto
};
