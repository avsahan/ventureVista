
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const uploadGuidePhoto = require("../middleware/guide-photo.middleware");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/register/traveler", authController.registerTraveler);
router.post("/register/guide", uploadGuidePhoto.single("profilePhoto"), authController.registerGuide);
router.patch("/guide/profile", requireAuth, uploadGuidePhoto.single("profilePhoto"), authController.updateGuideProfile);
router.post("/login", authController.login);
router.get("/guides", authController.listGuides);
router.get("/guides/:id/photo", authController.guidePhoto);
router.get("/me", authController.me);
router.post("/logout", authController.logout);

module.exports = router;
