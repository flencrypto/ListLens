import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

function serializeError(err: unknown): Record<string, unknown> {
  if (!err || typeof err !== "object") return { message: String(err) };
  const e = err as Record<string, unknown>;
  const out: Record<string, unknown> = {
    type: (e["constructor"] as { name?: string } | undefined)?.name ?? "Error",
    message: e["message"],
    stack: e["stack"],
  };
  if (e["code"]) out["code"] = e["code"];
  if (e["detail"]) out["detail"] = e["detail"];
  if (e["constraint"]) out["constraint"] = e["constraint"];
  if (e["routine"]) out["routine"] = e["routine"];
  if (e["query"]) out["query"] = e["query"];
  if (e["params"]) out["params"] = e["params"];
  if (e["cause"]) out["cause"] = serializeError(e["cause"]);
  return out;
}

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  serializers: {
    err: serializeError,
    cause: serializeError,
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
