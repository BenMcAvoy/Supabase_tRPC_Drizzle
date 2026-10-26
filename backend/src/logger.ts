import type { FastifyServerOptions } from "fastify";

const isProduction = process.env.NODE_ENV === "production";

export const loggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "[REDACTED]",
  },
  ...(!isProduction && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
        singleLine: true,
      },
    },
  }),
} satisfies FastifyServerOptions["logger"];
