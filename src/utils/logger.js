function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();

  const extra = meta
    ? ` ${JSON.stringify(meta)}`
    : "";

  return `[${timestamp}] [${level}] ${message}${extra}`;
}

export const logger = {
  info(message, meta) {
    console.log(
      formatMessage("INFO", message, meta)
    );
  },

  warn(message, meta) {
    console.warn(
      formatMessage("WARN", message, meta)
    );
  },

  error(message, meta) {
    console.error(
      formatMessage("ERROR", message, meta)
    );
  },

  debug(message, meta) {
    console.debug(
      formatMessage("DEBUG", message, meta)
    );
  },
};