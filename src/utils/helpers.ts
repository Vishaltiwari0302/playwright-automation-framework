import { config } from '../config';
import log from './logger';

/**
 * General-purpose test helpers.
 */

/**
 * Await a condition with retries + backoff. Useful for polling API state
 * (e.g. a pet moving from "pending" -> "available") instead of hard sleeps.
 */
export async function waitFor<T = boolean>(
  predicate: () => Promise<T> | T,
  opts: { timeoutMs?: number; pollMs?: number; label?: string } = {}
): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? 20_000;
  const pollMs = opts.pollMs ?? 500;
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  for (;;) {
    const result = await Promise.resolve(predicate());
    if (result) return result;
    if (Date.now() - start >= timeoutMs) {
      throw new Error(`waitFor timed out after ${timeoutMs}ms${opts.label ? ` (${opts.label})` : ''}`);
    }
    await sleep(pollMs);
  }
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Generate a short, roughly-unique nonce for data names. */
export function nonce(len = 6): string {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

/** Build a test-safe resource name that is easy to find + clean up later. */
export function testLabel(base = 'pet'): string {
  return `${base}-at-${Date.now()}-${nonce(3)}`;
}

export function isConfigured(): boolean {
  return Boolean(config.base && config.apiBase);
}

export { log };
