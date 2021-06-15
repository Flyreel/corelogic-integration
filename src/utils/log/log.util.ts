import bunyan from "bunyan";

export const log = bunyan.createLogger({ name: "core-api" });

if (process.env.NODE_ENV === "test") {
  log.level(bunyan.FATAL + 1);
}
