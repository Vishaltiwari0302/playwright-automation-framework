/**
 * Lightweight console logger with levels + timestamps.
 * Keep it minimal — it intentionally does NOT depend on a logger library.
 */
type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const activeLevel: Level = (process.env.LOG_LEVEL as Level) ?? 'info';

function emit(level: Level, msg: string, ...args: unknown[]): void {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[activeLevel]) return;
  const stamp = new Date().toISOString();
  const line = `[${stamp}] [${level.toUpperCase().padEnd(5)}] ${msg}`;
  // eslint-disable-next-line no-console
  (console as any)[level](line, ...args);
}

export const log = {
  debug: (m: string, ...a: unknown[]) => emit('debug', m, ...a),
  info:  (m: string, ...a: unknown[]) => emit('info',  m, ...a),
  warn:  (m: string, ...a: unknown[]) => emit('warn',  m, ...a),
  error: (m: string, ...a: unknown[]) => emit('error', m, ...a),
};

export default log;
