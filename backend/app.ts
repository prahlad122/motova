
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import routes from "./src/routes/index.js";
import swaggerSpec from "./src/config/swagger.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:3000"
)
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger API documentation
app.use("/api-docs", (_req, res, next) => {
  // Swagger UI injects its initialization script and styles. Keep this relaxed
  // policy scoped to the documentation UI instead of weakening the API CSP.
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http: https:;",
  );
  next();
});

app.get("/api-docs.json", (_req, res) => {
  res.type("application/json").send(swaggerSpec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Motova API Documentation",
    swaggerOptions: {
      displayRequestDuration: true,
      filter: true,
      validatorUrl: null,
    },
  })
);

// API routes
app.use("/api/v1", routes);

// Global error handler
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected server error occurred.";

    res.status(500).json({
      success: false,
      message,
    });
  }
);

export default app;
