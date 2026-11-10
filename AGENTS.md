# AGENTS.md: mentor-mentee-app

Guide for anyone (human or agent) changing the web app. Read it before you write code.

React 19, TypeScript (strict), Vite, Redux Toolkit with redux-persist, React Router, Tailwind CSS v4, i18next. Port `8080`. Run and Docker instructions are in [README.md](README.md). Visual rules are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Layout

```
src/
  components/          Pages and features (auth/, layout/, Dashboard, Profile)
  components/ui/       Reusable design-system pieces (Button, Input, ...), exported from ui/index.ts
  components/hoc/      Higher-order components (withAuthentication)
  service/request/     All HTTP calls (api.ts)
  redux/               Store, typed hooks, reducers (slices)
  types/               API and domain types
  constants/           Shared constants (colors)
  i18n/                i18next setup and locales (pt-BR.json, en-US.json)
  hooks/               Shared hooks
.docker/               Dockerfile, nginx.conf and docker-compose.yml
```

## Backend access

- Every request goes through the gateway (`GATEWAY_BASE_URL` in `service/request/api.ts`). Never call a service port directly.
- Path prefixes: `/auth` for mentor-mentee-auth, `/mmc` for mentor-mentee-core. Use `API_ROUTES`, not string literals.
- Add calls as functions on a service object in `api.ts` (`authService`, `profileService`...). Components never import axios.
- Type every request and response in `types/`. No `unknown` or `any` in new code.
- Send the token with `Authorization: Bearer <token>`. Read it with `tokenUtils`.

## Errors

Every service answers errors as a problem detail with a list of field errors (`types/api.ts`, contract in the auth and core AGENTS.md).

- In `api.ts`, end every catch with `throw toApiRequestError(error)`. It parses any failure into an `ApiError`. Thunks reject with `toApiError(error)`.
- Show it with `ApiErrorAlert`. It translates the server `code` (`<service>.<context>.<error>`) from `apiErrors.problems`; `fallback` covers network errors, server errors and codes without a translation.
- Show field errors next to their input: `fieldErrorOf(error, 'address.city')` and `useFieldErrorText()`, which looks up `apiErrors.fields.<service>.<field>.<code>` (pass `error.service`, the first segment of the problem `code`), then `apiErrors.codes.<code>`, fills `params` (`{{min}}`, `{{max}}`) and falls back to the server text. `Size` uses `Size.min`, `Size.max` or `Size.range`. Pass those fields as `inlineFields` so the alert does not repeat them.
- A new backend code needs its text in both locales.
- Check the same rules as the backend before sending. Shared limits live in `constants/` with a comment naming the backend rule.

## TypeScript standards

### Types

- Let TypeScript infer a type when the right side shows it: a literal, `new`, or a typed constructor call.

  ```ts
  const retries = 3;
  const params = new URLSearchParams(filters);
  ```

- Annotate when the type is not visible: function parameters, exported function return types, values from untyped sources (JSON, `localStorage`, `catch`).

  ```ts
  const profile: Profile = await profileService.get(userId);
  export const getProfile = async (userId: number): Promise<Profile> => { ... };
  ```

- Prefer `type`/`interface` in `types/` over inline object types repeated in several files.

### Constants

- No magic strings or numbers. Name them in UPPER_SNAKE_CASE at module top (`GATEWAY_BASE_URL`, `API_ROUTES`), with `as const` for fixed maps.
- Constants shared across modules go in `src/constants/`.
- Colors come from the design system (`constants/colors.ts`, Tailwind theme). No hex values in components.

### Components

- Function components with hooks. One component per file, file named after it (`Profile.tsx`).
- Use `components/ui/` pieces before writing new markup. New reusable pieces go there and are exported from `ui/index.ts`.
- Use `useAppDispatch` / `useAppSelector` from `redux/hooks.ts`, not the untyped hooks.
- Global state only when several screens need it. Local state stays in the component.
- Protect pages that need login with `withAuthentication`.

### Text

- No user-facing text in code. Add keys to both `i18n/locales/pt-BR.json` and `en-US.json` and read them with `useI18n` / `t()`.

## How to add a page

1. Add the types in `types/`.
2. Add the API calls in `service/request/api.ts`.
3. Add the component in `components/`, built from `components/ui/`.
4. Add the route in `App.tsx`. Wrap it with `withAuthentication` if it needs login.
5. Add every text key to both locale files.
6. Run `npm run lint` and `npm run build`.

## Tests

There is no test runner yet. When you add one, use Vitest with React Testing Library:

- Test behaviour the user sees (text, roles, clicks), not implementation details.
- Mock HTTP at the network level (MSW), not by mocking `api.ts` internals.
- Name tests after the behaviour: `shows an error when login fails`.

Until then, check changes by hand with `npm run dev` against the running backend.

## Before you finish

```bash
npm run lint
npm run build
```

Both must pass. Update [README.md](README.md) when run steps or ports change.
