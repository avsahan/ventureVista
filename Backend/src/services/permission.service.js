const db = require("../config/db");

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function httpError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function mapRequest(row) {
  return {
    id:           row.id,
    fullName:     row.full_name,
    email:        row.email,
    phone:        row.phone || null,
    accountType:  row.account_type,
    accountEmail: row.account_email || null,
    requestType:  row.request_type,
    reference:    row.reference || null,
    description:  row.description,
    context:      row.context || null,
    status:       row.status,
    adminNotes:   row.admin_notes || null,
    reviewedBy:   row.reviewed_by || null,
    reviewedAt:   row.reviewed_at || null,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

// --------------------------------------------------
// Create a new permission request (public — no auth)
// --------------------------------------------------

async function createRequest(data) {
  const [result] = await db.execute(
    `INSERT INTO permission_requests
       (full_name, email, phone, account_type, account_email,
        request_type, reference, description, context)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.fullName.trim(),
      data.email.trim().toLowerCase(),
      data.phone  ? data.phone.trim()  : null,
      data.accountType,
      data.accountEmail ? data.accountEmail.trim().toLowerCase() : null,
      data.requestType,
      data.reference    ? data.reference.trim()    : null,
      data.description.trim(),
      data.context      ? data.context.trim()      : null,
    ]
  );

  const [rows] = await db.execute(
    "SELECT * FROM permission_requests WHERE id = ? LIMIT 1",
    [result.insertId]
  );

  if (!rows.length) {
    throw new Error("Request was created but could not be loaded.");
  }

  return mapRequest(rows[0]);
}

// --------------------------------------------------
// List all requests (admin)
// --------------------------------------------------

async function listRequests({ status, page = 1, limit = 20 } = {}) {
  const offset = (Math.max(1, page) - 1) * limit;
  const params = [];
  let where  = "";

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    where = "WHERE status = ?";
    params.push(status);
  }

  const [rows] = await db.execute(
    `SELECT * FROM permission_requests
     ${where}
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total FROM permission_requests ${where}`,
    params
  );

  return { requests: rows.map(mapRequest), total: Number(total), page, limit };
}

// --------------------------------------------------
// Get a single request by ID (admin)
// --------------------------------------------------

async function getRequest(id) {
  const [rows] = await db.execute(
    "SELECT * FROM permission_requests WHERE id = ? LIMIT 1",
    [id]
  );

  if (!rows.length) throw httpError("Permission request not found", 404);
  return mapRequest(rows[0]);
}

// --------------------------------------------------
// Review a request — approve or reject (admin)
// --------------------------------------------------

async function reviewRequest(id, reviewerId, { status, adminNotes }) {
  if (!["approved", "rejected"].includes(status)) {
    throw httpError("Status must be approved or rejected", 400);
  }

  const [result] = await db.execute(
    `UPDATE permission_requests
     SET status      = ?,
         admin_notes = ?,
         reviewed_by = ?,
         reviewed_at = NOW()
     WHERE id = ? AND status = 'pending'`,
    [status, adminNotes || null, reviewerId, id]
  );

  if (!result.affectedRows) {
    throw httpError("Request not found or already reviewed", 404);
  }

  return getRequest(id);
}

// --------------------------------------------------
// Dashboard statistics (admin)
// --------------------------------------------------

async function getStats() {
  const [[row]] = await db.execute(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'pending')  AS pending,
       SUM(status = 'approved') AS approved,
       SUM(status = 'rejected') AS rejected
     FROM permission_requests`
  );

  return {
    total:    Number(row.total),
    pending:  Number(row.pending),
    approved: Number(row.approved),
    rejected: Number(row.rejected),
  };
}

module.exports = { createRequest, listRequests, getRequest, reviewRequest, getStats };
