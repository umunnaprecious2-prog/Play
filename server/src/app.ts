import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import routes from "./routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { apiLimiter } from "./middlewares/rateLimit";

// Render puts this app behind a reverse proxy. Without trusting it, every
// request looks like it comes from Render's proxy IP, not the real visitor
// -- which would make rate limiting either apply to all users as one shared
// bucket, or (if trusted too broadly) be bypassable via a spoofed
// X-Forwarded-For header. `1` trusts exactly one hop (Render's own proxy),
// which is the correct setting for this deployment shape.
const app = express();
app.set("trust proxy", 1);

// Known real origins that ever legitimately call this API from a browser:
// the production static frontend, local dev, and the packaged Capacitor
// app's WebView (Android defaults to https://localhost, iOS to
// capacitor://localhost -- neither is user-configurable here since
// capacitor.config.ts doesn't override the default scheme/hostname).
// Non-browser clients (curl, admin tooling, server-to-server) aren't
// affected either way -- CORS is a browser-enforced restriction, not a
// server-side auth check.
const allowedOrigins = [
  "https://play-frontend-static.onrender.com",
  "https://localhost",
  "capacitor://localhost",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
];

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header at all (curl, server-to-server, native non-WebView
      // requests) isn't a browser CORS scenario -- allow it through.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Play API 🚀",
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
