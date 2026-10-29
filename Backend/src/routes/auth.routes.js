
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const uploadGuidePhoto = require("../middleware/guide-photo.middleware");

router.post("/register/traveler", authController.registerTraveler);
router.post("/register/guide", uploadGuidePhoto.single("profilePhoto"), authController.registerGuide);
router.post("/login", authController.login);
router.get("/guides", authController.listGuides);
router.get("/guides/:id/photo", authController.guidePhoto);
router.get("/me", authController.me);
router.post("/logout", authController.logout);

module.exports = router;
