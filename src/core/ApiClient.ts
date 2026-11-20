import { APIRequestContext, APIResponse, expect, Page, Response } from '@playwright/test';
import { config } from '../config';

/**
 * ApiClient — a thin wrapper over Playwright's APIRequestContext.
 *
 * Benefits of using Playwright's request context:
 *   - shares HTTP state (headers, cookies) with the browser session
 *   - gets Playwright's response object (status, headers, json()) for free
 *   - works headful AND headless
 *
 * We intentionally do NOT use `axios` / `fetch` so the framework stays on a
 * single runtime dependency.
 */
/**
 * Some APIs (e.g. Petstore) mint ids that exceed Number.MAX_SAFE_INTEGER —
 * JSON.parse() then silently rounds them and the round-tripped id 404s.
 * Single-pass scan: wrap any whole-number JSON token with > 15 significant
 * digits in quotes (so it parses as a safe string); everything else,
 * including decimals, exponents, and content inside string literals, is
 * left untouched.
 */
function preserveBigInts(text: string): string {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === '\\') { out += text[++i] ?? ''; }
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      let j = i;
      if (text[j] === '-') j++;
      const digitsStart = j;
      while (j < text.length && text[j] >= '0' && text[j] <= '9') j++;
      const intDigits = j - digitsStart;
      let isWhole = true;
      let end = j;
      if (text[j] === '.') {
        isWhole = false;
        j++;
        while (j < text.length && text[j] >= '0' && text[j] <= '9') j++;
      }
      if (text[j] === 'e' || text[j] === 'E') {
        isWhole = false;
        j++;
        if (text[j] === '+' || text[j] === '-') j++;
        while (j < text.length && text[j] >= '0' && text[j] <= '9') j++;
      }
      const token = text.slice(i, j);
      out += isWhole && intDigits > 15 ? `"${token}"` : token;
      i = j - 1;
    } else {
      out += ch;
    }
  }
  return out;
}

export class ApiClient {
  private readonly ctx: APIRequestContext;

  constructor(ctx: APIRequestContext) {
    this.ctx = ctx;
  }

  protected url(path: string): string {
    return path.startsWith('http') ? path : `${config.apiBase}/${path.replace(/^\//, '')}`;
  }

  /* --------------------------------------------------------------- verbs */
  private async doRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    body?: unknown
  ): Promise<{ status: number; body: T }> {
    const startedAt = Date.now();
    const res: APIResponse = await this.ctx.fetch(
      this.url(path),
      {
        method,
        headers: {
          'content-type': 'application/json',
          ...(config.api.key ? { 'api-key': config.api.key } : {}),
        },
        data: body,
      }
    );

    let json: T;
    const text = await res.text();
    try {
      json = (text.trim() ? JSON.parse(preserveBigInts(text)) : undefined) as T;
    } catch {
      json = text as unknown as T;
    }

    return { status: res.status(), body: json };
  }

  get  <T = any>(path: string)              { return this.doRequest<T>('GET',      path); }
  post <T = any>(path: string, body: any)   { return this.doRequest<T>('POST',     path, body); }
  put  <T = any>(path: string, body: any)   { return this.doRequest<T>('PUT',      path, body); }
  patch<T = any>(path: string, body: any)   { return this.doRequest<T>('PATCH',    path, body); }
  del  <T = any>(path: string)              { return this.doRequest<T>('DELETE',   path); }

  /* ---------------------------------------------------------- assertions */
  async expectOk(res: { status: number; body: any }): Promise<void> {
    expect(res.status, `status was ${res.status}, body=${JSON.stringify(res.body)}`).toBe(200);
  }

  async expectCreated(res: { status: number; body: any }): Promise<void> {
    expect(res.status, `status was ${res.status}, body=${JSON.stringify(res.body)}`).toBe(201);
  }
}

/**
 * Helper for UI tests that want to mix Playwright requestContext + Page.
 * `page.request` exposes the APIRequestContext bound to the same cookie jar.
 */
export const buildClientFromPage = (page: Page): ApiClient =>
  new ApiClient(page.request);

/**
 * Standalone client for API-only tests (no Page needed).
 * Requires a `request` fixture from the standard Playwright fixtures.
 */
export const buildClient = (ctx: APIRequestContext): ApiClient => new ApiClient(ctx);

/**
 * Quick helper for asserting on the raw Response (when tests grab `res`
 * directly from `page.request.fetch` instead of ApiClient).
 */
export const assertResponseStatus = (res: Response, code: number): void => {
  expect(res.status()).toBe(code);
};
