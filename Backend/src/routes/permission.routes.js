const express  = require("express");
const ctrl      = require("../controllers/permission.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Public — anyone can submit a permission request
router.post("/permissions", ctrl.submitRequest);

// Admin-only — require authentication for read/review operations
router.get("/permissions/stats",  requireAuth, ctrl.getStats);
router.get("/permissions",        requireAuth, ctrl.listRequests);
router.get("/permissions/:id",    requireAuth, ctrl.getRequest);
router.patch("/permissions/:id/review", requireAuth, ctrl.reviewRequest);

module.exports = router;
