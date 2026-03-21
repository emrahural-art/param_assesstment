type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
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
