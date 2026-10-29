const multer = require("multer");

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Profile photo must be a JPEG, PNG, WEBP, or GIF image");
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});
