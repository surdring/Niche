export type LogFields = Readonly<Record<string, unknown>>;

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

export const createNoopLogger = (): Logger => {
  const noop = (_message: string, _fields?: LogFields): void => {
    return;
  };

  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop
  };
};
