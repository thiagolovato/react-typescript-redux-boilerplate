import { expect, test, type APIRequestContext } from '@playwright/test';
import { authHeaders, coordinatorToken, CORE, errorCodeOf, PARTICIPANT_ROLES, registerParticipant } from '../support/api';
import { addDays, toIsoDate, today } from '../support/dates';
import { TEST_COHORT_PREFIX } from '../support/env';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS, NON_EXISTENT_ID } from '../support/http';
import { randomSuffix } from '../support/random';
import { MAX_PAIRS_PER_COHORT, MIN_PER_COHORT } from '../support/rules';

// REGRAS_DE_NEGOCIO.md section 5 (cohorts) and 2.7 (coordination endpoints).
const COHORTS = `${CORE}/coordination/cohorts`;

// Cohorts go in far-future years so they never touch real ones. Each worker gets its own block of years and
// takes them in order, so tests never share a year. The global setup deletes test cohorts left by older runs.
const FIRST_FAR_FUTURE_YEAR = 2200;
const YEARS_PER_WORKER = 100;
const OPEN_COHORT_LENGTH_DAYS = 30;
let yearsTakenByThisWorker = 0;

function nextFreeFarFutureYear(): number {
  const workerFirstYear = FIRST_FAR_FUTURE_YEAR + test.info().workerIndex * YEARS_PER_WORKER;
  return workerFirstYear + (yearsTakenByThisWorker++ % YEARS_PER_WORKER);
}

function cohortRequest(startsOn: string, endsOn: string, overrides: Record<string, unknown> = {}) {
  return {
    name: `${TEST_COHORT_PREFIX}${startsOn}-${randomSuffix()}`,
    startsOn,
    endsOn,
    maxPairs: MAX_PAIRS_PER_COHORT,
    maxMenteesPerMentor: MIN_PER_COHORT,
    ...overrides,
  };
}

/** Request for a cohort covering the whole year. */
const wholeYearCohortRequest = (year: number, overrides: Record<string, unknown> = {}) =>
  cohortRequest(`${year}-01-01`, `${year}-12-31`, overrides);

function createCohort(request: APIRequestContext, token: string, body: object) {
  return request.post(COHORTS, { headers: authHeaders(token), data: body });
}

function updateCohort(request: APIRequestContext, token: string, id: number, body: object) {
  return request.put(`${COHORTS}/${id}`, { headers: authHeaders(token), data: body });
}

test.describe('cohort API', () => {
  let token: string;

  test.beforeEach(() => {
    token = coordinatorToken();
  });

  test('only the coordinator reaches /coordination/** (2.7, 5.6)', async ({ request }) => {
    for (const role of PARTICIPANT_ROLES) {
      const participant = await registerParticipant(request, role);
      const list = await request.get(COHORTS, { headers: authHeaders(participant.token) });
      expect(list.status()).toBe(HTTP_STATUS.FORBIDDEN);
      expect(await errorCodeOf(list)).toBe(ERROR_CODES.core.accessDenied);

      const create = await createCohort(request, participant.token, wholeYearCohortRequest(nextFreeFarFutureYear()));
      expect(create.status()).toBe(HTTP_STATUS.FORBIDDEN);
    }
    expect((await request.get(COHORTS)).status()).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('coordinator creates, reads, lists and edits a cohort (5.1, 5.6)', async ({ request }) => {
    const year = nextFreeFarFutureYear();
    const maxPairs = MAX_PAIRS_PER_COHORT - 1;
    const created = await createCohort(request, token, wholeYearCohortRequest(year, { maxPairs }));
    expect(created.status(), await created.text()).toBe(HTTP_STATUS.CREATED);
    const body = await created.json();
    expect(created.headers()['location']).toContain(`/coordination/cohorts/${body.id}`);
    expect(body).toMatchObject({ startsOn: `${year}-01-01`, endsOn: `${year}-12-31`, maxPairs, open: false });

    const read = await request.get(`${COHORTS}/${body.id}`, { headers: authHeaders(token) });
    expect(await read.json()).toEqual(body);

    const list: { id: number }[] = await (await request.get(COHORTS, { headers: authHeaders(token) })).json();
    expect(list.map((item) => item.id)).toContain(body.id);

    const newName = `${body.name}-edited`;
    const maxMenteesPerMentor = MIN_PER_COHORT + 1;
    const edited = await updateCohort(request, token, body.id,
      cohortRequest(`${year}-02-01`, `${year}-11-30`, { name: newName, maxMenteesPerMentor }));
    expect(edited.status()).toBe(HTTP_STATUS.OK);
    expect(await edited.json()).toMatchObject({ id: body.id, name: newName, startsOn: `${year}-02-01`, maxMenteesPerMentor });
  });

  test('end date must come after the start date (5.1)', async ({ request }) => {
    const year = nextFreeFarFutureYear();
    const endsBeforeStart = [`${year}-06-01`, `${year}-05-31`];
    const endsOnStart = [`${year}-06-01`, `${year}-06-01`];
    for (const [startsOn, endsOn] of [endsBeforeStart, endsOnStart]) {
      const response = await createCohort(request, token, cohortRequest(startsOn, endsOn));
      expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.cohortInvalidDates);
    }
  });

  test('two cohorts never share a day; both dates count (5.2)', async ({ request }) => {
    const year = nextFreeFarFutureYear();
    const first = await createCohort(request, token, cohortRequest(`${year}-01-01`, `${year}-06-30`));
    expect(first.status()).toBe(HTTP_STATUS.CREATED);

    const sharesLastDay = await createCohort(request, token, cohortRequest(`${year}-06-30`, `${year}-12-31`));
    expect(sharesLastDay.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(sharesLastDay)).toBe(ERROR_CODES.core.cohortOverlap);

    const startsNextDay = await createCohort(request, token, cohortRequest(`${year}-07-01`, `${year}-12-31`));
    expect(startsNextDay.status()).toBe(HTTP_STATUS.CREATED);
  });

  test('editing a cohort onto another one is refused (5.2)', async ({ request }) => {
    const year = nextFreeFarFutureYear();
    await createCohort(request, token, cohortRequest(`${year}-01-01`, `${year}-03-31`));
    const second = await (await createCohort(request, token, cohortRequest(`${year}-06-01`, `${year}-08-31`))).json();
    const moved = await updateCohort(request, token, second.id, cohortRequest(`${year}-03-15`, `${year}-08-31`));
    expect(moved.status()).toBe(HTTP_STATUS.CONFLICT);
  });

  test('pair limit between 1 and 20; mentees per mentor at least 1 (5.4, 5.5)', async ({ request }) => {
    const year = nextFreeFarFutureYear();
    const invalidLimits = [
      { maxPairs: MAX_PAIRS_PER_COHORT + 1 },
      { maxPairs: MIN_PER_COHORT - 1 },
      { maxMenteesPerMentor: MIN_PER_COHORT - 1 },
      { maxPairs: null },
    ];
    for (const overrides of invalidLimits) {
      const response = await createCohort(request, token, wholeYearCohortRequest(year, overrides));
      expect(response.status(), JSON.stringify(overrides)).toBe(HTTP_STATUS.BAD_REQUEST);
    }
    const atLimit = await createCohort(request, token, wholeYearCohortRequest(year, { maxPairs: MAX_PAIRS_PER_COHORT }));
    expect(atLimit.status()).toBe(HTTP_STATUS.CREATED);
  });

  test('the open cohort is the one containing today (5.3)', async ({ request }) => {
    const startsOn = today();
    const endsOn = toIsoDate(addDays(new Date(), OPEN_COHORT_LENGTH_DAYS));
    const response = await createCohort(request, token, cohortRequest(startsOn, endsOn));
    // Someone already has a cohort covering today in this database; it must then be the open one.
    if (response.status() === HTTP_STATUS.CONFLICT) {
      const list: { startsOn: string; endsOn: string; open: boolean }[] =
        await (await request.get(COHORTS, { headers: authHeaders(token) })).json();
      const current = list.find((item) => item.startsOn <= startsOn && startsOn <= item.endsOn);
      expect(current?.open).toBe(true);
      return;
    }
    expect(response.status()).toBe(HTTP_STATUS.CREATED);
    expect((await response.json()).open).toBe(true);
  });

  test('cohorts are never deleted (5.6)', async ({ request }) => {
    const created = await (await createCohort(request, token, wholeYearCohortRequest(nextFreeFarFutureYear()))).json();
    const response = await request.delete(`${COHORTS}/${created.id}`, { headers: authHeaders(token) });
    expect(response.status()).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
    expect((await request.get(`${COHORTS}/${created.id}`, { headers: authHeaders(token) })).status())
      .toBe(HTTP_STATUS.OK);
  });

  test('unknown cohort answers 404', async ({ request }) => {
    const response = await request.get(`${COHORTS}/${NON_EXISTENT_ID}`, { headers: authHeaders(token) });
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.cohortNotFound);
  });
});
