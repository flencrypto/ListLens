import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const parseOrigins = (value?: string): string[] =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const EXPLICIT_ALLOWED_ORIGINS = new Set([
  ...parseOrigins(process.env["FRONTEND_ORIGINS"]),
  ...parseOrigins(process.env["FRONTEND_ORIGIN"]),
  "http://localhost:5173",
  "http://localhost:3000",
]);

const DYNAMIC_ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/i,
];

const isAllowedOrigin = (origin: string): boolean => {
  if (EXPLICIT_ALLOWED_ORIGINS.has(origin)) return true;
  return DYNAMIC_ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
};

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Some PWA/service-worker and native-webview requests may have no Origin header.
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
  }),
);
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/api/webhooks/stripe") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json({ limit: "30mb" })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
