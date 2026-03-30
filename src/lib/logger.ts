type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

const DB_PERSIST_LEVELS: LogLevel[] = ["error", "warn"];

function persistToDb(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
  if (!DB_PERSIST_LEVELS.includes(level)) return;

  import("@/lib/prisma")
    .then(({ db }) =>
      db.appLog.create({
        data: {
          level,
          message: message.slice(0, 500),
          context: context ?? null,
          data: data ?? undefined,
        },
      })
    )
    .catch(() => {});
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") console.debug(output);
      break;
    default:
      console.log(output);
  }

  persistToDb(level, message, context, data);
}

export const logger = {
  info: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("info", message, context, data),
  warn: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("warn", message, context, data),
  error: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("error", message, context, data),
  debug: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("debug", message, context, data),
};
