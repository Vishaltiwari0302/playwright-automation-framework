/**
 * Central environment-driven configuration.
 *
 * Every value in this object should come from `process.env` (via `.env`)
 * so that environments / data sources can be switched without touching code.
 */

export interface Config {
  env: 'dev' | 'staging' | 'prod' | string;
  base: string;          // UI base URL
  apiBase: string;       // API base URL
  timeoutMs: number;     // global action timeout
  auth: { username: string; password: string };
  api: { key?: string };
  seedPets: string[];
}

const parse = (v: string | undefined, fallback: string) =>
  v && v.trim().length > 0 ? v.trim() : fallback;

const envName = (process.env.NODE_ENV ?? 'dev').toLowerCase();

export const config: Config = {
  env: (['dev', 'staging', 'prod', 'local'].includes(envName) ? envName : 'dev') as Config['env'],
  base: parse(process.env.BASE_URL, 'https://petstore.swagger.io'),
  apiBase: parse(
    process.env.API_BASE_URL,
    'https://petstore.swagger.io/v2'
  ),
  timeoutMs:
    Number.parseInt(process.env.TIMEOUT_MS ?? '60000', 10) || 60000,
  auth: {
    username: parse(process.env.USERNAME, 'admin'),
    password: parse(process.env.PASSWORD, 'password123'),
  },
  api: {
    key: process.env.API_KEY ? process.env.API_KEY.trim() : undefined,
  },
  seedPets: (process.env.SEED_PET_NAMES ?? 'Rex,Milo')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export default config;
