
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const {
  notFound,
  errorHandler,
} = require("./middleware/error.middleware");

const app = express();
app.set("trust proxy", 1);

const authRoutes = require("./routes/auth.routes");
const bookingRoutes = require("./routes/booking.routes");
const permissionRoutes = require("./routes/permission.routes");

const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const fixedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...configuredOrigins,
]);

function isAllowedOrigin(origin) {
  return !origin || fixedOrigins.has(origin);
}

app.locals.isAllowedOrigin = isAllowedOrigin;

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Request body and cookie middleware
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VentureVista backend is running",
  });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", bookingRoutes);
app.use("/api/v1", permissionRoutes);

// Error handling (keep these last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
