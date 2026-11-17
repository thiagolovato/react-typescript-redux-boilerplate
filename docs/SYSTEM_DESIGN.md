# System design decisions

Decisions already made in the code, and why. Run steps are in the `README.md` at the workspace root (the folder that holds every service). Business rules are in [REGRAS_DE_NEGOCIO.md](REGRAS_DE_NEGOCIO.md) and the roadmap in [PLANO.md](PLANO.md).

## Scale

The pilot runs at most 20 pairs a year. Every decision below favours simple code and low running cost over throughput.

## Services

| Service | Owns |
|---|---|
| registry (Eureka, 8761) | Service discovery |
| gateway (8765) | Single entry point, CORS, routing: `/auth/**` to auth, `/mmc/**` to core |
| auth (8082) | Accounts, login, tokens, login lockout |
| core (8091) | Profiles, consent, reference data, matching |
| app (8080) | React web app. Talks only to the gateway |

Each service is its own Git repository with its own Docker stack. Open question: at this scale a single core with auth inside would be cheaper to run. Decide before production (PLANO.md, phase 5).

## Identity and access

- auth signs RS256 tokens. Other services verify them with the public key through `auth-shared`. No session state, no call to auth per request.
- The token carries the user id and one active role (`MENTOR`, `MENTEE`, `COORDINATOR`). Services take identity from the token, never from a request body.
- A participant account can hold both participant roles, with one core profile per role. Switching role asks auth for a new token, so every service still checks one role per request and nothing else changes for them.
- Redis counts failed logins to lock out brute force attempts.
- Profiles are private. A user reads and writes only their own profile. Other people's profiles and match suggestions are not exposed until the coordinator role exists.

## Data

- One PostgreSQL database per service (separate schemas `auth` and `core`). Flyway owns the schema; Hibernate only validates it.
- Transactions are opened explicitly with `TransactionExecutor`, never `@Transactional` (see core AGENTS.md).
- Writes happen in Java, in that transaction. The database only refuses: constraints and triggers that raise an error (published texts, signatures and the change history never change). No trigger writes data, so a change reads in one place and H2 tests behave like PostgreSQL. Any process can keep a history in one generic table, `change_history` (type, id, JSONB data), through `ChangeHistoryService`; a new kind needs no migration. Meetings (create, correction, delete) and ratings (every version) use it. Only exception: a compatibility trigger during a deploy, dropped in the next release (V8).
- auth keeps an authentication audit in `auth_event` (V6): one row per sign-up (refused ones too), login attempt, role added and role switch, with account, e-mail, IP, user agent and a JSONB with the portal, role or failure reason. Written by `AuthEventService` in Java; rows never change. Indexed for one account's history, one address's history and time ranges (BRIN on `created_at`, small and cheap to write because rows arrive in time order). Attempts refused by the rate limit are not written, so one address (an IPv6 /64) cannot fill it. A typed login that is not an e-mail and has no account is stored as a placeholder, since it may be a password. No retention yet (REGRAS_DE_NEGOCIO.md 2.16); when the table gets large, purge by `created_at` or partition it by month.
- Consent is an append-only history (`customer_consent`): one row per decision, with terms version and time. The current terms version is configuration (`mentormentee.consent.terms-version`, `TERMS_VERSION` in the app). Changing it asks everyone to accept again.
- Research use is a separate, optional consent.

## Matching

- `MatchScorer` gives each mentor-mentee pair a 0 to 100 score from weighted criteria (interest areas, language, location, profession, the mentee's gender preference, mentor experience). Weights are configuration.
- It is not exposed yet. In phase 2 only the coordinator will see suggestions, after hard filters (shared language, gender preference, no active pair).

## Quality

- Every repository runs its build and tests in GitHub Actions on push and pull request.
- Backend tests: unit, H2 integration, and PostgreSQL integration tests against the real migrations.
- App: lint and type-checked build. No test runner yet.
