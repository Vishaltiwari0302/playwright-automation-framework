# Playwright Automation Framework (TypeScript)

A production-style automation framework built with **TypeScript + Playwright**, combining
**UI testing (Page Object Model)** and **API testing** in one project.

Sample target: the public **Swagger Petstore** (`https://petstore.swagger.io`) — swap the
locators/API base to point at your own app.

## Architecture

```
.
├── playwright.config.ts        # projects, reporters, webServer hooks
├── package.json
├── tsconfig.json
├── .env.example                # copy to .env to configure
├── src/
│   ├── config/index.ts         # env-driven central config
│   ├── core/
│   │   ├── BasePage.ts         # shared POM base (navigation, locators, helpers)
│   │   └── ApiClient.ts        # typed wrapper over Playwright request context
│   ├── models/pet.ts           # shared domain types (UI + API)
│   ├── api/
│   │   ├── Api.ts              # facade: api.pets / api.orders / api.store / api.user
│   │   ├── PetsApi.ts
│   │   ├── OrdersApi.ts
│   │   ├── StoreApi.ts
│   │   └── UserApi.ts
│   ├── pages/
│   │   ├── LoginPage.ts        # Page Object
│   │   └── PetsPage.ts         # Page Object
│   ├── test-data/pets.json     # static test data
│   └── utils/
│       ├── logger.ts
│       └── helpers.ts          # waitFor/nonce/testLabel
└── tests/
    ├── fixtures/fixtures.ts    # custom fixtures: loginPage, petsPage, api
    ├── ui/
    │   ├── login.spec.ts       # UI: sign-in flows
    │   └── pets.spec.ts        # UI+API hybrid (API setup → UI assert)
    └── api/
        └── pets.spec.ts        # API: CRUD round-trip + negative tests
```

### Design principles

- **Page Object Model** for UI: tests speak in actions (`login`, `createViaUi`),
  never in CSS selectors. Locators live only in `src/pages/*`.
- **Resource-oriented API layer**: `api.pets.create(...)`, `api.store.inventory()`, …
- **Shared types** in `src/models` so UI and API tests use the same domain objects.
- **Fixtures** inject POMs and the API facade — per-test setup/teardown in one place.
- **Hybrid testing** pattern: create data via API (fast, deterministic), assert via UI.
- **Env-driven config** (`.env`) — switch environments without code changes.
- **Artifacts**: HTML + JSON reports, screenshots/video/traces on failure.

## Setup

```bash
cp .env.example .env     # adjust BASE_URL / API_BASE_URL / credentials
npm install
npx playwright install   # downloads browsers
```

## Run

> Full command reference (headed mode, test selection, CI flags, reports) → [docs/RUN-COMMANDS.md](docs/RUN-COMMANDS.md)

```bash
npm test                # everything (projects from $BROWSERS)
npm run test:ui         # UI suites only
npm run test:api        # API suites only
npm run test:headed     # headed + debug
npm run test:report     # open HTML report
npm run typecheck       # tsc --noEmit
```

## Writing a new test

**API-only** (no browser):

```ts
import { test, expect } from '../fixtures/fixtures';

test('creates a pet', async ({ api }) => {
  const pet = await api.pets.create({ name: 'Rex', status: 'available' });
  expect(pet.id).toBeTruthy();
  await api.pets.delete(pet.id);
});
```

**UI (Page Object)**:

```ts
import { test, expect } from '../fixtures/fixtures';

test('creates a pet via UI', async ({ loginPage, petsPage }) => {
  await loginPage.open();
  await loginPage.login();
  await petsPage.open();
  await petsPage.createViaUi('Rex', 'available');
  await petsPage.expectPetVisible('Rex');
});
```

**UI + API hybrid**: use the `request` fixture for setup, POMs for assertion.

## Pointing at your own app

1. Set `BASE_URL` / `API_BASE_URL` in `.env`.
2. Update locators in `src/pages/*.ts` (the only file layer that knows your DOM).
3. Add your endpoints as methods under `src/api/*` (one method per operation).
4. If you need a local stack: uncomment `webServer` in `playwright.config.ts`.
