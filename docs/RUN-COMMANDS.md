# Running Commands Reference

Reference of all supported ways to run tests in this framework. All commands run from the project root.

## npm scripts (package.json)

| Command | What it does |
|---|---|
| `npm test` | Run everything (projects from `$BROWSERS`) |
| `npm run test:ui` | UI suites only (`tests/ui`), list reporter |
| `npm run test:api` | API suites only (`tests/api`), list reporter |
| `npm run test:headed` | All tests, headed + `--debug` (slow, step-by-step) |
| `npm run test:report` | Open the last HTML report (`playwright show-report`) |
| `npm run test:chrome` | Only the chromium project |
| `npm run test:firefox` | Only the firefox project |
| `npm run test:webkit` | Only the webkit project |
| `npm run test:parallel` | Run with 2 workers |
| `npm run clean` | Remove `test-results/`, `playwright-report/`, `reports/` |
| `npm run typecheck` | `tsc --noEmit` |

## Headed mode (browser window visible)

| Command | What it does |
|---|---|
| `npx playwright test --headed` | Headed, normal speed |
| `npx playwright test --headed --debug` | Headed + step-by-step debugging (equals `test:headed`) |
| `npx playwright test tests/ui --headed` | Only the UI tests, headed |
| `npx playwright test tests/ui/login.spec.ts --headed` | A single spec file, headed |
| `npx playwright test --headed --project=chromium` | Headed on a specific browser |

> Note: `--debug` pauses before every step (slow). For fast headed runs use only `--headed`. On CI/headless Linux, headed mode also needs a display (`xvfb` or X server).

## Selecting tests

| Command | What it does |
|---|---|
| `npx playwright test tests/ui/login.spec.ts` | One spec file |
| `npx playwright test -g "signs in successfully"` | Filter by test title (substring) |
| `npx playwright test -g "pattern1 or pattern2"` | Regex filter (use `-g <regex>` with extended syntax) |
| `npx playwright test --project=chromium` | Only one browser project |
| `npx playwright test --grep @smoke` | Filter by tag (tags defined in tests) |

## Useful run flags

| Flag | Purpose |
|---|---|
| `--headed` | Show the browser window |
| `--debug` | Step-by-step debugger (implies headed) |
| `--ui` | Playwright UI mode (GUI to record/inspect runs) |
| `--reporter=html` / `list` / `junit` | Choose reporter |
| `--workers=2` | Limit parallel workers (also `--parallel` / `--fully-parallel`) |
| `--retries=2` | Retry failed tests |
| `--reporter=line --output=test-results-f2` | Custom output dir |
| `--list` | List all tests without running |
| `PWTEST_TIMEOUT=120000 npx playwright test` | Override global timeout via env |

## Common workflows

```bash
# Full local run
npm test

# Quick UI check of one flow, browser visible
npx playwright test tests/ui/login.spec.ts --headed

# Re-run only failures from the last run
npx playwright test --last-failed

# Re-run failures and then everything to confirm green
npx playwright test --last-failed --forbid-failures

# CI-style run with HTML + JUnit reports
npx playwright test --reporter=html,junit

# Inspect what ran
npm run test:report
```

## Reports & artifacts

- HTML report → `playwright-report/` (open with `npm run test:report`)
- Failure screenshots / videos / traces → `test-results/`
- Clear both: `npm run clean`
