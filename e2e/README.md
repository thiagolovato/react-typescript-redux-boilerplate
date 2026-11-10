# End-to-end tests

Playwright tests for the business rules already built ([REGRAS_DE_NEGOCIO.md](../../REGRAS_DE_NEGOCIO.md), items marked **[feito]**). Each test names the rule it covers, e.g. `(2.5)`.

| Folder | What it drives | Covers |
|---|---|---|
| `api/` | The gateway, with HTTP requests | Server rules: roles, logins, login limits, profile validation, consent, cohorts |
| `ui/` | The app in Chromium | Sign-up, sign-in, coordinator login, pages by role, profile form |
| `support/` | Shared helpers | Addresses, API calls, database access, UI steps |

## Run

1. Start the backend in Docker (workspace [README](../../README.md), section 2): registry, gateway, auth, core, their databases and Redis.
2. Install the browser once:

   ```bash
   npx playwright install chromium
   ```

3. Run the tests. Playwright starts `npm run dev` on port 8080, or reuses the app already running there.

   ```bash
   npm run test:e2e
   ```

`npm run test:e2e:ui` opens the Playwright UI. `npx playwright show-report` opens the last HTML report.

## Test data

The tests need the local Docker containers, because they set up and clean data straight in the databases (`support/testData.ts`):

- **Setup** deletes data a previous run left (see `E2E_KEEP_DATA`), creates the coordinator `coordinator@e2e.test` (password `coordinator`) in the auth database and logs it in once. Workers read that token with `coordinatorToken()`. Sign-up never creates coordinators.
- **Setup and teardown** delete every login-attempt counter in Redis. All test traffic comes from one IP, so the per-IP limit (50 failed logins in 15 minutes) would block the next run.
- **Teardown** deletes accounts and profiles under `@e2e.test` and cohorts named `e2e-...`. Set `E2E_KEEP_DATA=1` to keep them for debugging; the next run's setup deletes them.

Cohorts go in far-future years. Each worker takes its own block of years in order, so tests never share a year and never touch real cohorts. The test for the open cohort creates one that contains today; if the database already has one, it checks that one instead.

Limits of the backend that shape the tests:

- The server counts logins still in progress against the 5-per-account limit. Five logins of one account at the same moment lock it, so tests never log the coordinator in from every test.
- One run makes about 25 failed logins on purpose. `--repeat-each 2` or more goes over the per-IP limit of 50 and the later repeats fail with "locked". Repeat single files instead.

Other addresses or container names: see `support/env.ts` (`E2E_APP_URL`, `E2E_GATEWAY_URL`, `E2E_*_CONTAINER`).

## Layout of `support/`

| File | What it holds |
|---|---|
| `env.ts` | Addresses, containers, test accounts and passwords |
| `rules.ts` | Business-rule limits; reuses the app constants and names the backend constant for the others |
| `http.ts`, `errorCodes.ts` | HTTP statuses and problem detail codes the tests expect |
| `api.ts` | Requests to auth and core, request bodies, token helpers |
| `ui.ts` | Locale texts, app routes and UI steps (login, sign-up, logout) |
| `db.ts`, `testData.ts` | psql and redis-cli in the containers; test data setup and cleanup |
| `dates.ts`, `random.ts` | Date and random-text helpers |

## Writing tests

- No magic numbers or strings: statuses from `HTTP_STATUS`, error codes from `ERROR_CODES`, limits from `rules.ts`, routes from `ui.ts`.
- Texts come from `src/i18n/locales/en-US.json` (`support/ui.ts` exports it as `en`). Never hard-code a screen text. Fill `{{placeholders}}` with `translate()`.
- Helper names say what they do: `request...` returns the raw response, `register...`/`fetch...` call the API and check it worked, `expectOn...` checks the page.
- Use `uniqueEmail()` for every account, so tests run in parallel and the cleanup finds them.
- Name tests after the behaviour and add the rule number from REGRAS_DE_NEGOCIO.md.
- Text inputs with a required mark: find them with `getByRole('textbox', { name, exact: true })`; their label text also holds the `*`.
- Code, names and comments in English.
