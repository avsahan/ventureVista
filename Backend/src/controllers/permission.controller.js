const { z } = require("zod");
const permissionService = require("../services/permission.service");

// --------------------------------------------------
// Validation schemas
// --------------------------------------------------

const ACCOUNT_TYPES = ["traveler", "guide", "other"];
const REQUEST_TYPES = [
  "Local guide registration",
  "Trip or itinerary access",
  "Profile or account change",
  "Other request",
];

const createSchema = z.object({
  fullName:     z.string().trim().min(2).max(150),
  email:        z.string().email().max(254),
  phone:        z.string().max(30).optional().nullable(),
  accountType:  z.enum(ACCOUNT_TYPES),
  accountEmail: z.string().email().max(254).optional().nullable().or(z.literal("")),
  requestType:  z.enum(REQUEST_TYPES),
  reference:    z.string().max(255).optional().nullable(),
  description:  z.string().trim().min(20).max(1200),
  context:      z.string().max(800).optional().nullable(),
});

const reviewSchema = z.object({
  status:     z.enum(["approved", "rejected"]),
  adminNotes: z.string().max(1000).optional().nullable(),
});

function validate(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error("Please check the submitted fields");
    error.status = 400;
    error.details = result.error.flatten().fieldErrors;
    throw error;
  }
  return result.data;
}

// --------------------------------------------------
// Handlers
// --------------------------------------------------

// POST /api/v1/permissions  — public
async function submitRequest(req, res, next) {
  try {
    const data    = validate(createSchema, req.body);
    const request = await permissionService.createRequest(data);
    return res.status(201).json({ success: true, request });
  } catch (error) { return next(error); }
}

// GET /api/v1/permissions  — admin
async function listRequests(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const result = await permissionService.listRequests({
      status,
      page:  Number(page)  || 1,
      limit: Number(limit) || 20,
    });
    return res.json({ success: true, ...result });
  } catch (error) { return next(error); }
}

// GET /api/v1/permissions/:id  — admin
async function getRequest(req, res, next) {
  try {
    const request = await permissionService.getRequest(req.params.id);
    return res.json({ success: true, request });
  } catch (error) { return next(error); }
}

// PATCH /api/v1/permissions/:id/review  — admin
async function reviewRequest(req, res, next) {
  try {
    const data    = validate(reviewSchema, req.body);
    const request = await permissionService.reviewRequest(
      req.params.id,
      req.userId,
      data
    );
    return res.json({ success: true, request });
  } catch (error) { return next(error); }
}

// GET /api/v1/permissions/stats  — admin
async function getStats(req, res, next) {
  try {
    const stats = await permissionService.getStats();
    return res.json({ success: true, stats });
  } catch (error) { return next(error); }
}

module.exports = { submitRequest, listRequests, getRequest, reviewRequest, getStats };
